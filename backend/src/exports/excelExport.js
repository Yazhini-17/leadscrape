const ExcelJS = require('exceljs');

const FIELDNAMES = [
  'Organization Name', 'Category', 'Website', 'Phone', 'Alternate Phone',
  'Email', 'WhatsApp', 'Address', 'City', 'State', 'Pincode',
  'Contact Person', 'Designation', 'Facebook', 'Instagram', 'LinkedIn',
  'YouTube', 'Twitter', 'Confidence Score', 'Confidence Level',
  'Phone Source', 'Email Source', 'Address Source', 'Scraped Date',
];

function getFirstPhone(org, isWhatsapp = false) {
  if (!org.phone_numbers || org.phone_numbers.length === 0) return '';
  for (const p of org.phone_numbers) {
    if (Boolean(p.is_whatsapp) === isWhatsapp) {
      return p.normalized || p.number || '';
    }
  }
  return '';
}

function getAltPhone(org) {
  if (!org.phone_numbers || org.phone_numbers.length === 0) return '';
  let mainFound = false;
  for (const p of org.phone_numbers) {
    if (!p.is_whatsapp) {
      if (mainFound) {
        return p.normalized || p.number || '';
      }
      mainFound = true;
    }
  }
  return '';
}

function getFirstEmail(org) {
  if (!org.email_addresses || org.email_addresses.length === 0) return '';
  return org.email_addresses[0].normalized || org.email_addresses[0].email || '';
}

function getWebsite(org) {
  if (!org.websites || org.websites.length === 0) return '';
  for (const w of org.websites) {
    if (w.is_official) return w.url;
  }
  return org.websites[0].url;
}

function getSocial(org, platform) {
  if (!org.social_links || org.social_links.length === 0) return '';
  for (const sl of org.social_links) {
    if (sl.platform === platform) return sl.url;
  }
  return '';
}

function getContactPerson(org) {
  if (!org.contacts || org.contacts.length === 0) return '';
  return org.contacts[0].name || '';
}

function getDesignation(org) {
  if (!org.contacts || org.contacts.length === 0) return '';
  return org.contacts[0].designation || '';
}

function flattenOrg(org) {
  const created = org.created_at
    ? new Date(org.created_at).toISOString().replace('T', ' ').substring(0, 16)
    : '';

  const phoneSource = (org.phone_numbers || []).find(p => p.source_url)?.source_url || '';
  const emailSource = (org.email_addresses || []).find(e => e.source_url)?.source_url || '';

  return {
    'Organization Name': org.name || '',
    'Category': org.category || '',
    'Website': getWebsite(org),
    'Phone': getFirstPhone(org, false),
    'Alternate Phone': getAltPhone(org),
    'Email': getFirstEmail(org),
    'WhatsApp': getFirstPhone(org, true),
    'Address': org.address || '',
    'City': org.city || '',
    'State': org.state || '',
    'Pincode': org.pincode || '',
    'Contact Person': getContactPerson(org),
    'Designation': getDesignation(org),
    'Facebook': getSocial(org, 'FACEBOOK'),
    'Instagram': getSocial(org, 'INSTAGRAM'),
    'LinkedIn': getSocial(org, 'LINKEDIN'),
    'YouTube': getSocial(org, 'YOUTUBE'),
    'Twitter': getSocial(org, 'TWITTER'),
    'Confidence Score': org.confidence_score || 0,
    'Confidence Level': org.confidence_level || 'LOW',
    'Phone Source': phoneSource,
    'Email Source': emailSource,
    'Address Source': org.address_source || '',
    'Scraped Date': created,
  };
}

const MINT = 'FF14B8A6';
const DARK = 'FF334155';
const ALT_ROW_FILL = 'FFF1F5F9';
const BORDER_COLOR = 'FFD1D5DB';

async function generateExcel(organizations, taskInfo = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LeadScrape';
  workbook.created = new Date();

  // ─── Leads Sheet ─────────────────────────────────────────────────────────
  const ws = workbook.addWorksheet('Leads');

  // Freeze top row
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  // Define columns
  ws.columns = FIELDNAMES.map(field => ({
    header: field,
    key: field,
    width: Math.max(field.length + 4, 15),
  }));

  // Style header row
  const headerRow = ws.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: DARK },
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } },
    };
  });

  // Add data rows
  organizations.forEach((org, idx) => {
    const flat = flattenOrg(org);
    const row = ws.addRow(flat);
    const isAlt = idx % 2 === 1;

    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: false };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
      };

      if (isAlt) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: ALT_ROW_FILL },
        };
      }

      // Confidence level coloring
      const header = FIELDNAMES[colNumber - 1];
      if (header === 'Confidence Level') {
        const val = String(cell.value || '').toUpperCase();
        if (val === 'HIGH') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF16A34A' } };
        } else if (val === 'MEDIUM') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFD97706' } };
        } else {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFDC2626' } };
        }
      }
    });
  });

  // Auto-fit column widths
  ws.columns.forEach(column => {
    let maxLength = column.header.length;
    column.eachCell({ includeEmpty: false }, (cell, rowNum) => {
      if (rowNum <= 100) {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLength) {
          maxLength = Math.min(len, 50);
        }
      }
    });
    column.width = maxLength + 4;
  });

  // ─── Task Info Sheet ─────────────────────────────────────────────────────
  const ws2 = workbook.addWorksheet('Task Info');
  ws2.getColumn(1).width = 25;
  ws2.getColumn(2).width = 40;

  ws2.mergeCells('A1:B1');
  const titleCell = ws2.getCell('A1');
  titleCell.value = 'LeadScrape Export';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: MINT },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 25;

  const infoRows = [
    ['Task ID', taskInfo.task_id || ''],
    ['Location', taskInfo.location || ''],
    ['Keyword', taskInfo.keyword || ''],
    ['Total Records', organizations.length],
    ['Export Source', 'LeadScrape v1.0'],
  ];

  infoRows.forEach((item, i) => {
    const row = ws2.addRow(item);
    row.getCell(1).font = { name: 'Calibri', bold: true };
    row.getCell(2).font = { name: 'Calibri' };
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = {
  FIELDNAMES,
  flattenOrg,
  generateExcel,
};
