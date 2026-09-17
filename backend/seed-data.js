/**
 * LeadScrape — Dummy Data Seeder (Node.js version)
 * Ported from backend/seed_data.py with identical behavior and schema compatibility.
 * Safe to re-run: idempotent, clears previous demo tasks before inserting fresh rows.
 */

const { Op } = require('sequelize');
const {
  sequelize,
  User,
  ScrapingTask,
  Organization,
  Website,
  Contact,
  PhoneNumber,
  EmailAddress,
  SocialLink,
  SourcePage,
  SavedLead,
  ScrapingLog,
} = require('./src/models');
const { hashPassword } = require('./src/services/authService');

const DEMO_EMAIL = 'demo@leadscrape.io';
const DEMO_PASSWORD = 'Demo1234!';

const CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Bengaluru', 'Hyderabad'];
const KEYWORDS = ['dental clinics', 'law firms', 'gyms', 'coworking spaces', 'cafes'];
const NAME_STEMS = [
  'Sunrise', 'Bluewave', 'Prime', 'Urban', 'Apex', 'Golden', 'Silver',
  'Metro', 'Skyline', 'Everest', 'Horizon', 'Crescent', 'Pinnacle',
  'Evergreen', 'Bright', 'Northstar',
];
const NAME_SUFFIXES = [
  'Dental Care', 'Law Associates', 'Fitness Studio', 'Coworks', 'Cafe',
  'Consultants', 'Clinic', 'Workspace', 'Legal Partners', 'Wellness Center',
];
const DOMAINS = [
  'sunrisedental.in', 'bluewavelaw.com', 'primefitness.co.in',
  'urbanworkspace.in', 'apexcafe.com', 'goldenlegal.in',
  'metroclinic.co.in', 'skylinecoworks.com', 'everestwellness.in',
];
const PHONE_TYPES = ['MAIN', 'ALTERNATE', 'OFFICE', 'WHATSAPP'];
const EMAIL_TYPES = ['INFO', 'CONTACT', 'SUPPORT', 'GENERAL'];
const SOCIAL_PLATFORMS = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN'];
const PAGE_TYPES = ['home', 'about', 'contact'];
const FIRST_NAMES = ['Priya', 'Arjun', 'Kavya', 'Rahul', 'Sneha', 'Vikram', 'Divya', 'Karthik'];
const DESIGNATIONS = ['Founder', 'Manager', 'Director', 'Owner', 'Admin Head'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randSample(arr, k) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, k);
}

function randPhone() {
  return `+91 ${randInt(70000, 99999)}${randInt(10000, 99999)}`;
}

function randPincode() {
  return String(randInt(600001, 641050));
}

async function cleanUserData(userId) {
  // Find all DEMO tasks for this user
  const demoTasks = await ScrapingTask.findAll({
    where: {
      user_id: userId,
      task_id: { [Op.like]: 'DEMO%' },
    },
    attributes: ['id'],
  });

  const taskIds = demoTasks.map(t => t.id);

  if (taskIds.length > 0) {
    const orgs = await Organization.findAll({
      where: { task_id: { [Op.in]: taskIds } },
      attributes: ['id'],
    });
    const orgIds = orgs.map(o => o.id);

    if (orgIds.length > 0) {
      await SavedLead.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await Website.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await Contact.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await PhoneNumber.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await EmailAddress.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await SourcePage.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await SocialLink.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await Organization.destroy({ where: { id: { [Op.in]: orgIds } } });
    }

    await ScrapingLog.destroy({ where: { task_id: { [Op.in]: taskIds } } });
    await ScrapingTask.destroy({ where: { id: { [Op.in]: taskIds } } });
  }

  // Also clean any orphan saved leads for this user
  await SavedLead.destroy({ where: { user_id: userId } });
}

async function seedUserTasks(user) {
  console.log(`Seeding data for user: ${user.email} (ID: ${user.id})...`);
  await cleanUserData(user.id);

  const namePool = [];
  for (const s of NAME_STEMS) {
    for (const x of NAME_SUFFIXES) {
      namePool.push(`${s} ${x}`);
    }
  }
  namePool.sort(() => 0.5 - Math.random());
  let nameIndex = 0;
  function getNextName() {
    if (nameIndex >= namePool.length) nameIndex = 0;
    return namePool[nameIndex++];
  }

  const taskDefs = [
    { status: 'COMPLETED', count: 40 },
    { status: 'COMPLETED', count: 25 },
    { status: 'RUNNING', count: 12 },
    { status: 'FAILED', count: 3 },
    { status: 'PENDING', count: 0 },
  ];

  let totalOrgs = 0;
  const userCreatedOrgs = [];

  for (let i = 0; i < taskDefs.length; i++) {
    const { status, count: orgCount } = taskDefs[i];
    const city = CITIES[i % CITIES.length];
    const keyword = KEYWORDS[i % KEYWORDS.length];
    const daysAgo = (taskDefs.length - i) * 2;
    const created = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const completed = ['COMPLETED', 'FAILED'].includes(status)
      ? new Date(created.getTime() + 18 * 60 * 1000)
      : null;

    const taskId = user.email === DEMO_EMAIL
      ? `DEMO${String(i + 1).padStart(3, '0')}`
      : `DEMO${user.id}_${String(i + 1).padStart(3, '0')}`;

    const task = await ScrapingTask.create({
      task_id: taskId,
      user_id: user.id,
      status,
      location: city,
      keyword,
      search_radius: 15,
      max_results: 100,
      max_pages_per_site: 20,
      required_fields: JSON.stringify(['phone', 'email']),
      results_discovered: orgCount + randInt(0, 5),
      websites_found: orgCount,
      websites_crawled: status === 'COMPLETED' ? orgCount : Math.max(orgCount - 3, 0),
      phones_found: orgCount * 2,
      emails_found: Math.floor(orgCount * 1.5),
      addresses_found: orgCount,
      duplicates_removed: randInt(0, 4),
      error_message: status === 'FAILED' ? 'Timed out contacting 3 sites after repeated retries.' : null,
      created_at: created,
      updated_at: created,
      completed_at: completed,
    });

    await ScrapingLog.create({
      task_id: task.id,
      url: `https://www.google.com/search?q=${keyword.replace(/\s+/g, '+')}+${city.toLowerCase()}`,
      status: status !== 'FAILED' ? 'SUCCESS' : 'FAILED',
      pages_crawled: orgCount,
      phones_extracted: orgCount * 2,
      emails_extracted: Math.floor(orgCount * 1.5),
      error_message: status === 'FAILED' ? 'Connection reset by peer' : null,
      created_at: created,
    });

    for (let j = 0; j < orgCount; j++) {
      const orgName = getNextName();
      const domain = DOMAINS[totalOrgs % DOMAINS.length];
      const score = parseFloat((Math.random() * (0.98 - 0.35) + 0.35).toFixed(2));
      const level = score >= 0.75 ? 'HIGH' : score >= 0.5 ? 'MEDIUM' : 'LOW';
      const areas = ['Anna Nagar', 'MG Road', 'Velachery', 'T Nagar', 'Indiranagar'];
      const area = randChoice(areas);

      const org = await Organization.create({
        task_id: task.id,
        name: orgName,
        category: keyword.replace(/\b\w/g, c => c.toUpperCase()),
        location: city,
        address: `${randInt(1, 199)}, ${area}, ${city}`,
        street: `${randInt(1, 199)} Main Road`,
        area,
        city,
        state: ['Chennai', 'Coimbatore', 'Madurai'].includes(city) ? 'Tamil Nadu' : 'Karnataka',
        pincode: randPincode(),
        address_source: 'contact_page',
        confidence_score: score,
        confidence_level: level,
        source: 'google_search',
        is_duplicate: false,
        created_at: created,
        updated_at: created,
      });

      userCreatedOrgs.push(org);
      totalOrgs++;

      await Website.create({
        organization_id: org.id,
        url: `https://www.${domain}`,
        domain,
        is_official: true,
        discovery_source: 'google_search',
        confidence: score,
        status: 'ACTIVE',
        created_at: created,
      });

      const contactCount = randInt(1, 2);
      for (let c = 0; c < contactCount; c++) {
        await Contact.create({
          organization_id: org.id,
          name: `${randChoice(FIRST_NAMES)} ${randChoice(['Kumar', 'Rao', 'Nair', 'Sharma', 'Iyer'])}`,
          designation: randChoice(DESIGNATIONS),
          source_url: `https://www.${domain}/about`,
          created_at: created,
        });
      }

      const phoneCount = randInt(1, 2);
      for (let p = 0; p < phoneCount; p++) {
        const num = randPhone();
        await PhoneNumber.create({
          organization_id: org.id,
          number: num,
          normalized: num.replace(/\s+/g, ''),
          phone_type: randChoice(PHONE_TYPES),
          source_url: `https://www.${domain}/contact`,
          is_whatsapp: Math.random() > 0.6,
          created_at: created,
        });
      }

      const emailLocal = orgName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
      await EmailAddress.create({
        organization_id: org.id,
        email: `${emailLocal}@${domain}`,
        normalized: `${emailLocal}@${domain}`,
        email_type: randChoice(EMAIL_TYPES),
        source_url: `https://www.${domain}/contact`,
        is_valid: true,
        created_at: created,
      });

      const selectedPages = randSample(PAGE_TYPES, randInt(1, 3));
      for (const pt of selectedPages) {
        await SourcePage.create({
          organization_id: org.id,
          url: `https://www.${domain}/${pt !== 'home' ? pt : ''}`,
          page_type: pt,
          status_code: 200,
          scraped_at: created,
          created_at: created,
        });
      }

      const selectedSocials = randSample(SOCIAL_PLATFORMS, randInt(0, 2));
      for (const plat of selectedSocials) {
        await SocialLink.create({
          organization_id: org.id,
          platform: plat,
          url: `https://${plat.toLowerCase()}.com/${emailLocal}`,
          is_valid: true,
          created_at: created,
        });
      }
    }
  }

  // Add 5 saved leads
  const savedSample = randSample(userCreatedOrgs, Math.min(5, userCreatedOrgs.length));
  for (const org of savedSample) {
    await SavedLead.create({
      user_id: user.id,
      organization_id: org.id,
      notes: 'Follow up next week — looked promising on first pass.',
    });
  }

  console.log(`✓ Seeded ${taskDefs.length} tasks and ${totalOrgs} organizations for ${user.email}.`);
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('LeadScrape — Connected to database for seeding...');

    // 1. Ensure demo user exists
    let demoUser = await User.findOne({ where: { email: DEMO_EMAIL } });
    if (!demoUser) {
      demoUser = await User.create({
        email: DEMO_EMAIL,
        full_name: 'Demo User',
        hashed_password: hashPassword(DEMO_PASSWORD),
        is_active: true,
        is_verified: true,
      });
      console.log(`✓ Created demo user: ${DEMO_EMAIL}`);
    }

    // 2. Fetch all existing users in the database
    const allUsers = await User.findAll();
    console.log(`Found ${allUsers.length} user(s) in users table.`);

    // 3. Seed tasks & organizations for each user
    for (const user of allUsers) {
      await seedUserTasks(user);
    }

    console.log('\n=============================================');
    console.log('✓ Dummy data seeded successfully!');
    console.log(`\nDemo login:\n  email:    ${DEMO_EMAIL}\n  password: ${DEMO_PASSWORD}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
