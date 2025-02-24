const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
        host: config.development.host,
        dialect: config.development.dialect,
        logging: console.log // Enable logging to see SQL queries
    }
);
// Import models
const User = require('./models/user');
const ContentCreator = require('./models/contentCreator');
const Media = require('./models/media');
const Deal = require('./models/deal');
const Company = require('./models/company');

// Create associations here

// User -> ContentCreator (One-to-One)
User.hasOne(ContentCreator, { foreignKey: 'creator_id', onDelete: 'CASCADE' });
ContentCreator.belongsTo(User, { foreignKey: 'creator_id' });

// User -> Company (One-to-One)
User.hasOne(Company, { foreignKey: 'company_id', onDelete: 'CASCADE' });
Company.belongsTo(User, { foreignKey: 'company_id' });

// ContentCreator -> Media (Profile Picture, One-to-One)
ContentCreator.belongsTo(Media, { foreignKey: 'profile_picture_id', as: 'profile_picture' });
Media.hasMany(ContentCreator, { foreignKey: 'profile_picture_id' });

// ContentCreator -> Deal (One-to-Many)
ContentCreator.hasMany(Deal, { foreignKey: 'creator_id', onDelete: 'SET NULL' });
Deal.belongsTo(ContentCreator, { foreignKey: 'creator_id' });

// Company -> Deal (One-to-Many)
Company.hasMany(Deal, { foreignKey: 'company_id', onDelete: 'CASCADE' });
Deal.belongsTo(Company, { foreignKey: 'company_id' });

// Company -> Media (One-to-Many)
Company.hasMany(Media, { foreignKey: 'company_id', onDelete: 'CASCADE' });
Media.belongsTo(Company, { foreignKey: 'company_id' });

// ContentCreator -> Media (Many-to-One, Portfolio)
ContentCreator.hasMany(Media, { foreignKey: 'creator_id', onDelete: 'SET NULL' });
Media.belongsTo(ContentCreator, { foreignKey: 'creator_id' });

// Deal -> Media (Many-to-One, Attach Media to Deals)
Deal.hasMany(Media, { foreignKey: 'deal_id', onDelete: 'SET NULL' });
Media.belongsTo(Deal, { foreignKey: 'deal_id' });

// Sync models with the database
sequelize.sync({ force: false }).then(() => {
  console.log('Database & tables have been synchronized!');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  ContentCreator,
  Media,
  Deal,
  Company,
};