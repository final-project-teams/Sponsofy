// Import the sequelize module
const { Sequelize, DataTypes } = require("sequelize")
require("dotenv").config()
const config = require("./config")

const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
  host: config.development.host,
  dialect: config.development.dialect,
})

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


// Create associations here
Contract.hasMany(pre_Term)
pre_Term.belongsTo(Contract)

// User -> ContentCreator (One-to-One)
User.hasOne(ContentCreator, { foreignKey: "userId", as: "contentCreator" })
ContentCreator.belongsTo(User, { foreignKey: "userId", as: "user" })

// User -> Company (One-to-One)
User.hasOne(Company, { foreignKey: "userId", as: "company" })
Company.belongsTo(User, { foreignKey: "userId", as: "user" })

// ContentCreator and Media relationship for social media stats
ContentCreator.hasMany(Media, { foreignKey: "contentCreatorId", as: "media" })
Media.belongsTo(ContentCreator, { foreignKey: "contentCreatorId", as: "contentCreator" })

// ContentCreator and Media relationship for profile picture
ContentCreator.belongsTo(Media, { as: "ProfilePicture", foreignKey: "profilePictureId" })
Media.hasMany(ContentCreator, { foreignKey: "profilePictureId" })

// ContentCreator -> DealRequest (Many-to-Many)
ContentCreator.belongsToMany(Deal, { through: DealRequest, as: "DealRequests" })
Deal.belongsToMany(ContentCreator, { through: DealRequest, as: "ContentCreators" })

// ContentCreator -> Deal (One-to-Many)
ContentCreator.hasMany(Deal, { as: "ContentCreatorDeals", foreignKey: "contentCreatorId" })
Deal.belongsTo(ContentCreator, { as: "ContentCreatorDeals", foreignKey: "contentCreatorId" })

// Company -> Deal (One-to-Many)
Company.hasMany(Contract)
Contract.belongsTo(Company)

Contract.hasMany(Deal)
Deal.belongsTo(Contract)

// Direct one-to-many relationship
Contract.belongsTo(Criteria, { foreignKey: 'criteriaId' })
Criteria.hasMany(Contract, { foreignKey: 'criteriaId' })

// Many-to-many relationship through ContractCriteria
Contract.belongsToMany(Criteria, {
  through: ContractCriteria,
  foreignKey: 'contractId',
  otherKey: 'criteriaId',
  as: 'criteria'
});

Criteria.belongsToMany(Contract, {
  through: ContractCriteria,
  foreignKey: 'criteriaId',
  otherKey: 'contractId',
  as: 'contracts'
});

// Company -> Media (One-to-Many)
Company.hasMany(Media)
Media.belongsTo(Company)

Term.hasMany(Media)
Media.belongsTo(Term)

Term.hasMany(Post)
Post.belongsTo(Term)

Message.hasMany(Media, { foreignKey: 'MessageId' });
Media.belongsTo(Message, { foreignKey: 'MessageId' });

Deal.hasMany(Media, { as: "AttachedMedia", foreignKey: "dealId" })
Media.belongsTo(Deal, { foreignKey: "dealId" })

Account.hasMany(Post)
Post.belongsTo(Account)

Contract.hasMany(Deal)
Deal.belongsTo(Contract)

Deal.hasMany(Term)
Term.belongsTo(Deal)

Term.hasMany(Negotiation)
Negotiation.belongsTo(Term)

Criteria.hasMany(SubCriteria)
SubCriteria.belongsTo(Criteria)

User.hasOne(Signature)
Signature.belongsTo(User)

User.hasMany(Notification)
Notification.belongsTo(User)

// Room.hasMany(Message)
// Message.belongsTo(Room)

// User.hasMany(Message)
// Message.belongsTo(User)
////////////////////////////////////////

Criteria.hasMany(SubCriteria,{
  foreignKey: "criteriaId",
  as: "sub_criterias",
})

SubCriteria.belongsTo(Criteria,{
  foreignKey: "subcriteriaId",
  as: "criterias",
})

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
})

Account.belongsTo(ContentCreator, {
  foreignKey: "contentCreatorId",
  as: "content_creators",
})

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

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to the database has been established successfully.")
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error)
  })

// Sync models with the database
// Modify the sync process to handle dependencies correctly
async function syncDatabase() {
  try {
    // First, synchronize the Criteria model
    await Criteria.sync({ alter: true });
    console.log('Criteria table synchronized');
    
    // Then synchronize SubCriteria which depends on Criteria
    await SubCriteria.sync({ alter: true });
    console.log('SubCriteria table synchronized');
    
    // Then synchronize Contract which depends on Criteria
    await Contract.sync({ alter: true });
    console.log('Contract table synchronized');
    
    // Then synchronize ContractCriteria which depends on both Contract and Criteria
    // Force: true will drop and recreate the table to fix the primary key issue
    await ContractCriteria.sync({ force: true });
    console.log('ContractCriteria table synchronized');
    
    // Then synchronize all remaining models
    const remainingModels = [
      User, ContentCreator, Media, Deal, Company, Account, Post, 
      Term, Negotiation, Signature, Notification, 
      Room, Message, Payment, DealRequest, pre_Term, UserRoom, ContentCreatorSubCriteria
    ];
    
    for (const model of remainingModels) {
      await model.sync({ alter: true });
    }
    
    console.log('All database tables have been synchronized!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

// Execute the sync function
// syncDatabase();

// sequelize.sync({ force: true }) // Use `force: true` only in development
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
    ContentCreatorSubCriteria
};
