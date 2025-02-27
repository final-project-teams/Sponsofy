const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const config = require('./config');

const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect, 
  });

// Import models
const User = require('./models/user')(sequelize, DataTypes);
const ContentCreator = require('./models/contentCreator')(sequelize, DataTypes);
const Media = require('./models/media')(sequelize, DataTypes);
const Deal = require('./models/deal')(sequelize, DataTypes);
const Company = require('./models/company')(sequelize, DataTypes);
const Account = require('./models/account')(sequelize, DataTypes);
const Post = require('./models/post')(sequelize, DataTypes);
const Contract = require('./models/contract')(sequelize, DataTypes);
const Term = require('./models/term')(sequelize, DataTypes);
const Negotiation = require('./models/negotiation')(sequelize, DataTypes);
const Criteria = require('./models/criteria')(sequelize, DataTypes);
const SubCriteria = require('./models/subCriteria')(sequelize, DataTypes);
const ContractCriteria = require('./models/contract_criteria')(sequelize, DataTypes);
const Signature = require('./models/signature')(sequelize, DataTypes);
const Notification = require('./models/notification')(sequelize, DataTypes);
const Room = require('./models/room')(sequelize, DataTypes);
const Message = require('./models/message')(sequelize, DataTypes);

// Create associations here

// User -> ContentCreator (One-to-One)
User.hasOne(ContentCreator);
ContentCreator.belongsTo(User);

// User -> Company (One-to-One)
User.hasOne(Company);
Company.belongsTo(User);

// ContentCreator -> Media (Profile Picture, One-to-One)
ContentCreator.belongsTo(Media, { as: 'ProfilePicture', foreignKey: 'profilePictureId' });
Media.hasMany(ContentCreator, { foreignKey: 'profilePictureId' });

// ContentCreator -> Deal (One-to-Many)
ContentCreator.hasMany(Deal);
Deal.belongsTo(ContentCreator);

// Company -> Deal (One-to-Many)
Company.hasMany(Contract);
Contract.belongsTo(Company);

Contract.hasMany(Deal);
Deal.belongsTo(Contract);

Contract.belongsToMany(Criteria, {
  through: ContractCriteria, // Use the join table
  foreignKey: 'contractId', // Foreign key in the join table
  as: 'criteria', // Alias for the association
});

// Criteria belongs to many Contracts (through ContractCriteria)
Criteria.belongsToMany(Contract, {
  through: ContractCriteria, // Use the join table
  foreignKey: 'criteriaId', // Foreign key in the join table
  as: 'contracts', // Alias for the association
});


// Company -> Media (One-to-Many)
Company.hasMany(Media);
Media.belongsTo(Company);

// ContentCreator -> Media (Many-to-One, Portfolio)
ContentCreator.hasMany(Media, { as: 'Portfolio', foreignKey: 'contentCreatorId' });
Media.belongsTo(ContentCreator, { foreignKey: 'contentCreatorId' });

// Deal -> Media (Many-to-One, Attach Media to Deals)
Deal.hasMany(Media, { as: 'AttachedMedia', foreignKey: 'dealId' });
Media.belongsTo(Deal, { foreignKey: 'dealId' });

// Account -> Post (One-to-Many)
Account.hasMany(Post);
Post.belongsTo(Account);

// Contract -> Deal (One-to-Many)
Contract.hasMany(Deal);
Deal.belongsTo(Contract);

// Deal -> Term (One-to-Many)
Deal.hasMany(Term);
Term.belongsTo(Deal);

// Term -> Negotiation (One-to-Many)
Term.hasMany(Negotiation);
Negotiation.belongsTo(Term);

// Contract -> Criteria (Many-to-Many through contract_criteria)
Contract.belongsTo(Criteria, { through: ContractCriteria });
Criteria.belongsTo(Contract, { through: ContractCriteria });

// Criteria -> SubCriteria (One-to-Many)
Criteria.hasMany(SubCriteria);
SubCriteria.belongsTo(Criteria);

// A user has one signature
User.hasOne(Signature);
Signature.belongsTo(User);

// A user has many notifications
User.hasMany(Notification);
Notification.belongsTo(User);

// A room has many messages
Room.hasMany(Message);
Message.belongsTo(Room);

// A message belongs to a user (either content creator or company)
User.hasMany(Message);
Message.belongsTo(User);

// ContentCreator can participate in many rooms (many-to-many relationship with room)
ContentCreator.belongsTo(Room);
Room.belongsTo(ContentCreator);

// Company can participate in many rooms (many-to-many relationship with room)
Company.belongsTo(Room);
Room.belongsTo(Company);

Criteria.hasMany(SubCriteria);
SubCriteria.belongsTo(Criteria);

// ContentCreator has many Accounts
ContentCreator.hasMany(Account, {
  foreignKey: 'contentCreatorId',
  as: 'accounts',
});

// Account belongs to a ContentCreator
Account.belongsTo(ContentCreator, {
  foreignKey: 'contentCreatorId',
  as: 'contentCreator',
});
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
  User,
  ContentCreator,
  Media,
  Deal,
  Company,
  Account,
  Post,
  Contract,
    Term,
    Negotiation,
    Criteria,
    SubCriteria,
    ContractCriteria,
    Notification,
    Signature,
    Room,
    Message
};