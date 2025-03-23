// Import the sequelize module
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();
const config = require("./config");

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
const Payment = require('./models/payment')(sequelize, DataTypes);
const DealRequest = require('./models/dealRequest')(sequelize, DataTypes);
const pre_Term = require('./models/pre_terms')(sequelize, DataTypes);
const UserRoom = require('./models/userRoom')(sequelize, DataTypes);
const ContentCreatorSubCriteria = require('./models/contentCreatorSubCriteria')(sequelize, DataTypes);
const Transaction = require('./models/Transaction ')(sequelize, DataTypes);
const CardPayment = require('./models/cardPayment')(sequelize, DataTypes); // Import the CardPayment model

// Create associations here
Contract.hasMany(pre_Term);
pre_Term.belongsTo(Contract);

// User -> ContentCreator (One-to-One)
User.hasOne(ContentCreator, { foreignKey: "userId", as: "contentCreator" });
ContentCreator.belongsTo(User, { foreignKey: "userId", as: "user" });

// User -> Company (One-to-One)
User.hasOne(Company, { foreignKey: "userId", as: "companyrs" });
Company.belongsTo(User, { foreignKey: "userId", as: "user" });

// ContentCreator and Media relationship for social media stats
ContentCreator.hasMany(Media, { foreignKey: "contentCreatorId", as: "media" });
Media.belongsTo(ContentCreator, { foreignKey: "contentCreatorId", as: "contentCreator" });

// ContentCreator and Media relationship for profile picture
ContentCreator.belongsTo(Media, { as: "ProfilePicture", foreignKey: "profilePictureId" });
Media.hasMany(ContentCreator, { foreignKey: "profilePictureId" });

// ContentCreator -> DealRequest (Many-to-Many)
ContentCreator.belongsToMany(Deal, { through: DealRequest, as: "DealRequests" });
Deal.belongsToMany(ContentCreator, { through: DealRequest, as: "ContentCreators" });

// ContentCreator -> Deal (One-to-Many)
ContentCreator.hasMany(Deal, { as: "ContentCreatorDeals", foreignKey: "contentCreatorId" });
Deal.belongsTo(ContentCreator, { as: "ContentCreatorDeals", foreignKey: "contentCreatorId" });

// Company -> Deal (One-to-Many)
Company.hasMany(Contract);
Contract.belongsTo(Company);

Contract.hasMany(Deal);
Deal.belongsTo(Contract);

Contract.belongsToMany(Criteria, {
  through: ContractCriteria,
  foreignKey: "contractId",
  as: "criteria",
});

Criteria.belongsToMany(Contract, {
  through: ContractCriteria,
  foreignKey: "criteriaId",
  as: "contracts",
});

// Company -> Media (One-to-Many)
Company.hasMany(Media);
Media.belongsTo(Company);

Term.hasMany(Media);
Media.belongsTo(Term);

Term.hasMany(Post);
Post.belongsTo(Term);

Message.hasMany(Media, { foreignKey: 'MessageId' });
Media.belongsTo(Message, { foreignKey: 'MessageId' });

Deal.hasMany(Media, { as: "AttachedMedia", foreignKey: "dealId" });
Media.belongsTo(Deal, { foreignKey: "dealId" });

Account.hasMany(Post);
Post.belongsTo(Account);

Contract.hasMany(Deal);
Deal.belongsTo(Contract);

Deal.hasMany(Term);
Term.belongsTo(Deal);

Term.hasMany(Negotiation);
Negotiation.belongsTo(Term);

Contract.belongsTo(Criteria, { through: ContractCriteria });
Criteria.belongsTo(Contract, { through: ContractCriteria });

Criteria.hasMany(SubCriteria);
SubCriteria.belongsTo(Criteria);

User.hasOne(Signature);
Signature.belongsTo(User);

User.hasMany(Notification);
Notification.belongsTo(User);

// Room.hasMany(Message)
// Message.belongsTo(Room)

// User.hasMany(Message)
// Message.belongsTo(User)
////////////////////////////////////////

Criteria.hasMany(SubCriteria,{
  foreignKey: "criteriaId",
  as: "sub_criterias",
});

SubCriteria.belongsTo(Criteria,{
  foreignKey: "subcriteriaId",
  as: "criterias",
});

/////////////////////////////////////////

// A room has many messages
Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages'
});
Message.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room'
});

// A message belongs to a user
User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'userMessages'
});
Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'sender'
});

// Room associations
Room.belongsToMany(User, {
  through: UserRoom,
  as: 'participants',
  foreignKey: 'roomId'
});

User.belongsToMany(Room, {
  through: UserRoom,
  as: 'rooms',
  foreignKey: 'userId'
});

// ContentCreator has many Accounts
ContentCreator.hasMany(Account, {
  foreignKey: "contentCreatorId",
  as: "accounts",
});

Account.belongsTo(ContentCreator, {
  foreignKey: "contentCreatorId",
  as: "content_creators",
});

// Many-to-Many relationship between ContentCreator and SubCriteria - UPDATED
ContentCreator.hasMany(ContentCreatorSubCriteria, {
  foreignKey: "contentCreatorId",
  as: "creator_sub",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ContentCreatorSubCriteria.belongsTo(ContentCreator, {
  foreignKey: "contentCreatorId",
  as: "content_creators",
});

// Sub Criteria and Creator Sub associations
SubCriteria.hasMany(ContentCreatorSubCriteria, {
  foreignKey: "subCriteriaId",
  as: "creator_sub",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ContentCreatorSubCriteria.belongsTo(SubCriteria, {
  foreignKey: "subCriteriaId",
  as: "sub_criterias",
});

// Transaction associations
ContentCreator.hasMany(Transaction, { foreignKey: 'contentCreatorId', as: 'transactions' });
Transaction.belongsTo(ContentCreator, { foreignKey: 'contentCreatorId', as: 'contentCreator' });

Deal.hasMany(Transaction, { foreignKey: 'dealId', as: 'transactions' });
Transaction.belongsTo(Deal, { foreignKey: 'dealId', as: 'deal' });

Company.hasMany(Transaction, { foreignKey: 'companyId', as: 'transactions' });
Transaction.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// CardPayment associations
Company.hasMany(CardPayment, { foreignKey: 'companyId', as: 'cardPayments' });
CardPayment.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

ContentCreator.hasMany(CardPayment, { foreignKey: 'contentCreatorId', as: 'cardPayments' });
CardPayment.belongsTo(ContentCreator, { foreignKey: 'contentCreatorId', as: 'contentCreator' });

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to the database has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// Sync models with the database
//  sequelize.sync({ alter: true }) // Use `force: true` only in development
//   .then(() => {
//     console.log('Database & tables have been synchronized!');
//   })
//   .catch((error) => {
//     console.error('Error syncing database:', error);
//   });

// Export models and sequelize instance
module.exports = {
  DealRequest,
  Payment,
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
  Message,
  pre_Term,
  UserRoom,
  ContentCreatorSubCriteria,
  Transaction,
  CardPayment, // Export the CardPayment model
};