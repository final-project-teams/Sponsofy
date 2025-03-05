const { Sequelize, DataTypes, Model } = require('sequelize');
require('dotenv').config();
const config = require('./config');

// Create Sequelize instance first
const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    logging: false // Disable logging to reduce console noise
});

// Create a module.exports object early to avoid circular references
const db = {
  sequelize: sequelize,
  Sequelize: Sequelize,
  DataTypes: DataTypes
};

// Export the db object immediately
module.exports = db;

// Import models
db.User = require('./models/user')(sequelize, DataTypes);
db.ContentCreator = require('./models/contentCreator')(sequelize, DataTypes);
db.Media = require('./models/media')(sequelize, DataTypes);
db.Deal = require('./models/deal')(sequelize, DataTypes);
db.Company = require('./models/company')(sequelize, DataTypes);
db.Account = require('./models/account')(sequelize, DataTypes);
db.Post = require('./models/post')(sequelize, DataTypes);
db.Contract = require('./models/contract')(sequelize, DataTypes);
db.Term = require('./models/term')(sequelize, DataTypes);
db.Negotiation = require('./models/negotiation')(sequelize, DataTypes);
db.Criteria = require('./models/criteria')(sequelize, DataTypes);
db.SubCriteria = require('./models/subCriteria')(sequelize, DataTypes);
db.ContractCriteria = require('./models/contract_criteria')(sequelize, DataTypes);
db.Signature = require('./models/signature')(sequelize, DataTypes);
db.Notification = require('./models/notification')(sequelize, DataTypes);
db.Room = require('./models/room')(sequelize, DataTypes);
db.Message = require('./models/message')(sequelize, DataTypes);

// Define associations
// User -> ContentCreator (One-to-One)
db.User.hasOne(db.ContentCreator, { foreignKey: 'userId', as: 'contentCreator' });
db.ContentCreator.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// User -> Company (One-to-One)
db.User.hasOne(db.Company, { foreignKey: 'userId', as: 'company' });
db.Company.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// ContentCreator -> Media (Profile Picture, One-to-One)
db.ContentCreator.belongsTo(db.Media, { as: 'ProfilePicture', foreignKey: 'profilePictureId' });
db.Media.hasMany(db.ContentCreator, { foreignKey: 'profilePictureId' });

// ContentCreator -> Deal (One-to-Many)
db.ContentCreator.hasMany(db.Deal);
db.Deal.belongsTo(db.ContentCreator);

// Company -> Deal (One-to-Many)
db.Company.hasMany(db.Contract);
db.Contract.belongsTo(db.Company);

db.Contract.hasMany(db.Deal);
db.Deal.belongsTo(db.Contract);

db.Contract.belongsToMany(db.Criteria, {
  through: db.ContractCriteria,
  foreignKey: 'contractId',
  as: 'criteria',
});

// Criteria belongs to many Contracts (through ContractCriteria)
db.Criteria.belongsToMany(db.Contract, {
  through: db.ContractCriteria,
  foreignKey: 'criteriaId',
  as: 'contracts',
});

// Company -> Media (One-to-Many)
db.Company.hasMany(db.Media);
db.Media.belongsTo(db.Company);

// ContentCreator -> Media (Many-to-One, Portfolio)
db.ContentCreator.hasMany(db.Media, { as: 'Portfolio', foreignKey: 'contentCreatorId' });
db.Media.belongsTo(db.ContentCreator, { foreignKey: 'contentCreatorId' });

// Deal -> Media (Many-to-One, Attach Media to Deals)
db.Deal.hasMany(db.Media, { as: 'AttachedMedia', foreignKey: 'dealId' });
db.Media.belongsTo(db.Deal, { foreignKey: 'dealId' });

// Account -> Post (One-to-Many)
db.Account.hasMany(db.Post);
db.Post.belongsTo(db.Account);

// Contract -> Deal (One-to-Many)
db.Contract.hasMany(db.Deal);
db.Deal.belongsTo(db.Contract);

// Deal -> Term (One-to-Many)
db.Deal.hasMany(db.Term);
db.Term.belongsTo(db.Deal);

// Term -> Negotiation (One-to-Many)
db.Term.hasMany(db.Negotiation);
db.Negotiation.belongsTo(db.Term);

// Criteria -> SubCriteria (One-to-Many)
db.Criteria.hasMany(db.SubCriteria);
db.SubCriteria.belongsTo(db.Criteria);

// A user has one signature
db.User.hasOne(db.Signature);
db.Signature.belongsTo(db.User);

// A user has many notifications
db.User.hasMany(db.Notification);
db.Notification.belongsTo(db.User);

// A room has many messages
db.Room.hasMany(db.Message);
db.Message.belongsTo(db.Room);

// A message belongs to a user (either content creator or company)
db.User.hasMany(db.Message);
db.Message.belongsTo(db.User);

// ContentCreator can participate in many rooms
db.ContentCreator.belongsTo(db.Room);
db.Room.belongsTo(db.ContentCreator);

// Company can participate in many rooms
db.Company.belongsTo(db.Room);
db.Room.belongsTo(db.Company);

// ContentCreator has many Accounts
db.ContentCreator.hasMany(db.Account, {
  foreignKey: 'contentCreatorId',
  as: 'accounts',
});

// Account belongs to a ContentCreator
db.Account.belongsTo(db.ContentCreator, {
  foreignKey: 'contentCreatorId',
  as: 'contentCreator',
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

// Sync models with the database
// sequelize.sync({ force:true }).then(() => {
//   console.log('Database & tables have been synchronized!');
// }).catch((error) => {
//   console.error('Error syncing database:', error);
// });

// Export models and sequelize instance

module.exports = {
  sequelize,
  User: db.User,
  ContentCreator: db.ContentCreator,
  Media: db.Media,
  Deal: db.Deal,
  Company: db.Company,
  Account: db.Account,
  Post: db.Post,
  Contract: db.Contract,
    Term: db.Term,
    Negotiation: db.Negotiation,
    Criteria: db.Criteria,
    SubCriteria: db.SubCriteria,
    ContractCriteria: db.ContractCriteria,
    Notification: db.Notification,
    Signature: db.Signature,
    Room: db.Room,
    Message: db.Message
};