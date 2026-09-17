function calculateConfidence(org) {
  let score = 0.0;

  // Website: 20 points
  if (org.websites && org.websites.some(w => w.status === 'ACTIVE' || !w.status)) {
    score += 20;
  }

  // Phone: 20 points
  if (org.phone_numbers && org.phone_numbers.length > 0) {
    score += 20;
  }

  // Email: 20 points
  if (org.email_addresses && org.email_addresses.length > 0) {
    score += 20;
  }

  // Address: 20 points
  if (org.address || org.city) {
    score += 20;
  }

  // Contact Person: 10 points
  if (org.contacts && org.contacts.length > 0) {
    score += 10;
  }

  // Social Links: 10 points
  if (org.social_links && org.social_links.length > 0) {
    score += 10;
  }

  // Determine level
  let level = 'LOW';
  if (score >= 80) {
    level = 'HIGH';
  } else if (score >= 50) {
    level = 'MEDIUM';
  }

  return { score, level };
}

function buildLeadListItem(org, savedIds = new Set()) {
  const plainOrg = org.toJSON ? org.toJSON() : org;

  let main_phone = null;
  let main_whatsapp = null;
  if (plainOrg.phone_numbers && plainOrg.phone_numbers.length > 0) {
    for (const p of plainOrg.phone_numbers) {
      if (p.is_whatsapp && !main_whatsapp) {
        main_whatsapp = p.normalized || p.number;
      }
      if (!p.is_whatsapp && !main_phone) {
        main_phone = p.normalized || p.number;
      }
    }
  }

  let main_email = null;
  if (plainOrg.email_addresses && plainOrg.email_addresses.length > 0) {
    main_email = plainOrg.email_addresses[0].email;
  }

  let main_website = null;
  if (plainOrg.websites && plainOrg.websites.length > 0) {
    for (const w of plainOrg.websites) {
      if (w.is_official) {
        main_website = w.url;
        break;
      }
    }
    if (!main_website) {
      main_website = plainOrg.websites[0].url;
    }
  }

  let contact_person = null;
  if (plainOrg.contacts && plainOrg.contacts.length > 0) {
    contact_person = plainOrg.contacts[0].name;
  }

  const isSaved = savedIds instanceof Set ? savedIds.has(plainOrg.id) : (Array.isArray(savedIds) ? savedIds.includes(plainOrg.id) : false);

  return {
    id: plainOrg.id,
    name: plainOrg.name,
    category: plainOrg.category,
    location: plainOrg.location,
    city: plainOrg.city,
    state: plainOrg.state,
    confidence_score: plainOrg.confidence_score || 0.0,
    confidence_level: plainOrg.confidence_level || 'LOW',
    is_saved: isSaved,
    created_at: plainOrg.created_at,
    main_phone,
    main_email,
    main_website,
    main_whatsapp,
    contact_person,
  };
}

module.exports = {
  calculateConfidence,
  buildLeadListItem,
};
