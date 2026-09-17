const PDFDocument = require('pdfkit');

/**
 * Generate a clean, paginated PDF report of leads for a scraping task.
 * 
 * @param {Array} orgs - List of organization Sequelize instances / plain objects with associations
 * @param {Object} taskInfo - { task_id, keyword, location, created_at }
 * @returns {Promise<Buffer>} - Resolves to PDF Buffer
 */
function generatePDF(orgs, taskInfo = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        layout: 'landscape', // 841.89 x 595.28 pt
        bufferPages: true,
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', err => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2; // ~761.89

      // Theme Colors
      const brandColor = '#0d9488'; // Mint/Teal
      const textPrimary = '#0f172a';
      const textSecondary = '#475569';
      const textMuted = '#94a3b8';
      const borderLine = '#e2e8f0';
      const rowAltBg = '#f8fafc';
      const tableHeaderBg = '#f1f5f9';

      // Column widths totaling 760
      const columns = [
        { key: 'name', label: 'Organization Name', width: 160 },
        { key: 'phone', label: 'Phone', width: 100 },
        { key: 'email', label: 'Email', width: 135 },
        { key: 'website', label: 'Website', width: 125 },
        { key: 'address', label: 'Address', width: 160 },
        { key: 'confidence', label: 'Confidence', width: 80, align: 'center' },
      ];

      function drawHeader() {
        // Document Title & Metadata
        doc
          .fillColor(brandColor)
          .font('Helvetica-Bold')
          .fontSize(18)
          .text('LeadScrape — Leads Report', margin, margin);

        const exportDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        // Meta row
        const metaY = margin + 24;
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(textSecondary)
          .text(
            `Task ID: ${taskInfo.task_id || 'N/A'}    |    Keyword: ${taskInfo.keyword || 'All'}    |    Location: ${taskInfo.location || 'All'}    |    Total Leads: ${orgs.length}    |    Export Date: ${exportDate}`,
            margin,
            metaY
          );

        // Thin divider
        doc
          .strokeColor(borderLine)
          .lineWidth(1)
          .moveTo(margin, metaY + 16)
          .lineTo(pageWidth - margin, metaY + 16)
          .stroke();

        return metaY + 24;
      }

      function drawTableHeader(y) {
        // Header background
        doc
          .rect(margin, y, contentWidth, 22)
          .fill(tableHeaderBg);

        doc
          .strokeColor(borderLine)
          .lineWidth(0.5)
          .rect(margin, y, contentWidth, 22)
          .stroke();

        let currentX = margin;
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(textPrimary);

        for (const col of columns) {
          const textX = currentX + 6;
          const textWidth = col.width - 12;
          doc.text(col.label, textX, y + 6, {
            width: textWidth,
            align: col.align || 'left',
            ellipsis: true,
          });
          currentX += col.width;
        }

        return y + 22;
      }

      // Draw initial document header
      let currentY = drawHeader();
      currentY = drawTableHeader(currentY);

      const rowHeight = 22;
      const bottomLimit = pageHeight - margin - 25; // Leave room for footer

      // Draw rows
      orgs.forEach((org, index) => {
        // Check for page overflow
        if (currentY + rowHeight > bottomLimit) {
          doc.addPage();
          currentY = drawTableHeader(margin);
        }

        // Alternate row background
        if (index % 2 === 1) {
          doc
            .rect(margin, currentY, contentWidth, rowHeight)
            .fill(rowAltBg);
        }

        // Draw row bottom border
        doc
          .strokeColor(borderLine)
          .lineWidth(0.5)
          .moveTo(margin, currentY + rowHeight)
          .lineTo(pageWidth - margin, currentY + rowHeight)
          .stroke();

        // Extract lead data
        const plainOrg = org.toJSON ? org.toJSON() : org;

        // Primary phone
        let phoneStr = '—';
        if (plainOrg.phone_numbers && plainOrg.phone_numbers.length > 0) {
          phoneStr = plainOrg.phone_numbers[0].normalized || plainOrg.phone_numbers[0].number || '—';
        }

        // Primary email
        let emailStr = '—';
        if (plainOrg.email_addresses && plainOrg.email_addresses.length > 0) {
          emailStr = plainOrg.email_addresses[0].email || '—';
        }

        // Primary website
        let websiteStr = '—';
        if (plainOrg.websites && plainOrg.websites.length > 0) {
          websiteStr = plainOrg.websites[0].url.replace(/^https?:\/\/(www\.)?/, '') || '—';
        }

        // Address
        const addressStr = plainOrg.address || plainOrg.city || plainOrg.location || '—';

        // Confidence
        const confidenceLevel = (plainOrg.confidence_level || 'LOW').toUpperCase();
        const confidenceScore = plainOrg.confidence_score ? `${Math.round(plainOrg.confidence_score)}%` : '';

        // Print row cells
        let cellX = margin;
        doc.font('Helvetica').fontSize(8).fillColor(textPrimary);

        // 1. Name
        doc.font('Helvetica-Bold').text(plainOrg.name || 'Unnamed', cellX + 6, currentY + 6, {
          width: columns[0].width - 12,
          ellipsis: true,
        });
        cellX += columns[0].width;

        // 2. Phone
        doc.font('Helvetica').fillColor(textSecondary).text(phoneStr, cellX + 6, currentY + 6, {
          width: columns[1].width - 12,
          ellipsis: true,
        });
        cellX += columns[1].width;

        // 3. Email
        doc.text(emailStr, cellX + 6, currentY + 6, {
          width: columns[2].width - 12,
          ellipsis: true,
        });
        cellX += columns[2].width;

        // 4. Website
        doc.fillColor('#0284c7').text(websiteStr, cellX + 6, currentY + 6, {
          width: columns[3].width - 12,
          ellipsis: true,
        });
        cellX += columns[3].width;

        // 5. Address
        doc.fillColor(textSecondary).text(addressStr, cellX + 6, currentY + 6, {
          width: columns[4].width - 12,
          ellipsis: true,
        });
        cellX += columns[4].width;

        // 6. Confidence Badge
        let badgeColor = '#64748b'; // Low
        if (confidenceLevel === 'HIGH') badgeColor = '#059669';
        else if (confidenceLevel === 'MEDIUM') badgeColor = '#d97706';

        doc.fillColor(badgeColor).font('Helvetica-Bold').text(
          `${confidenceLevel} ${confidenceScore ? `(${confidenceScore})` : ''}`,
          cellX + 6,
          currentY + 6,
          {
            width: columns[5].width - 12,
            align: 'center',
            ellipsis: true,
          }
        );

        currentY += rowHeight;
      });

      // Add page numbers on all buffered pages
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(textMuted)
          .text(
            `Page ${i + 1} of ${range.count}   •   Generated by LeadScrape`,
            margin,
            pageHeight - margin + 8,
            {
              width: contentWidth,
              align: 'center',
            }
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generatePDF,
};
