const sequelize = require('../config/database');
const User = require('./User');
const ScrapingTask = require('./ScrapingTask');
const Organization = require('./Organization');
const Website = require('./Website');
const Contact = require('./Contact');
const PhoneNumber = require('./PhoneNumber');
const EmailAddress = require('./EmailAddress');
const SocialLink = require('./SocialLink');
const SourcePage = require('./SourcePage');
const SavedLead = require('./SavedLead');
const ScrapingLog = require('./ScrapingLog');
const Export = require('./Export');

// User associations
User.hasMany(ScrapingTask, { foreignKey: 'user_id', as: 'tasks', onDelete: 'CASCADE' });
User.hasMany(SavedLead, { foreignKey: 'user_id', as: 'saved_leads', onDelete: 'CASCADE' });
User.hasMany(Export, { foreignKey: 'user_id', as: 'exports', onDelete: 'CASCADE' });

// ScrapingTask associations
ScrapingTask.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ScrapingTask.hasMany(Organization, { foreignKey: 'task_id', as: 'organizations', onDelete: 'CASCADE' });
ScrapingTask.hasMany(ScrapingLog, { foreignKey: 'task_id', as: 'logs', onDelete: 'CASCADE' });
ScrapingTask.hasMany(Export, { foreignKey: 'task_id', as: 'exports' });

// Organization associations
Organization.belongsTo(ScrapingTask, { foreignKey: 'task_id', as: 'task' });
Organization.hasMany(Website, { foreignKey: 'organization_id', as: 'websites', onDelete: 'CASCADE' });
Organization.hasMany(Contact, { foreignKey: 'organization_id', as: 'contacts', onDelete: 'CASCADE' });
Organization.hasMany(PhoneNumber, { foreignKey: 'organization_id', as: 'phone_numbers', onDelete: 'CASCADE' });
Organization.hasMany(EmailAddress, { foreignKey: 'organization_id', as: 'email_addresses', onDelete: 'CASCADE' });
Organization.hasMany(SocialLink, { foreignKey: 'organization_id', as: 'social_links', onDelete: 'CASCADE' });
Organization.hasMany(SourcePage, { foreignKey: 'organization_id', as: 'source_pages', onDelete: 'CASCADE' });
Organization.hasMany(SavedLead, { foreignKey: 'organization_id', as: 'saved_by', onDelete: 'CASCADE' });

// Relation associations
Website.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Contact.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
PhoneNumber.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
EmailAddress.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
SocialLink.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
SourcePage.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// SavedLead associations
SavedLead.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
SavedLead.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// ScrapingLog associations
ScrapingLog.belongsTo(ScrapingTask, { foreignKey: 'task_id', as: 'task' });

// Export associations
Export.belongsTo(ScrapingTask, { foreignKey: 'task_id', as: 'task' });
Export.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
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
  Export,
};
