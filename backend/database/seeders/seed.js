const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const { sequelize } = require('../connection');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  try {
    // First, sync the database to create missing tables
    await sequelize.sync({ alter: true });
    
    console.log('Clearing existing data...');
    
    // Clear tables in correct order
    try {
      await models.Message.destroy({ where: {} });
      await models.Room.destroy({ where: {} });
      await models.Account.destroy({ where: {} });
      await models.Deal.destroy({ where: {} });
      await models.Contract.destroy({ where: {} });
      await models.ContentCreator.destroy({ where: {} });
      await models.Company.destroy({ where: {} });
      await models.User.destroy({ where: {} });
    } catch (error) {
      console.log('Some tables might not exist yet, continuing...');
    }

    // Get all models
    const models = sequelize.models;
    
    // Create Users (Companies and Content Creators)
    const users = [];
    // Create 10 company users
    for (let i = 0; i < 10; i++) {
      users.push({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password_hash: await bcrypt.hash('password123', 10),
        role: 'company',
        verified: faker.datatype.boolean(),
        isPremium: faker.datatype.boolean(),
      });
    }
    // Create 20 content creator users
    for (let i = 0; i < 20; i++) {
      users.push({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password_hash: await bcrypt.hash('password123', 10),
        role: 'content_creator',
        verified: faker.datatype.boolean(),
        isPremium: faker.datatype.boolean(),
      });
    }
    const createdUsers = await models.User.bulkCreate(users);

    // Create Companies
    const companies = [];
    const companyUsers = createdUsers.filter(user => user.role === 'company');
    for (const user of companyUsers) {
      companies.push({
        name: faker.company.name(),
        industry: faker.company.buzzNoun(),
        location: faker.location.city(),
        description: faker.company.catchPhrase(),
        verified: faker.datatype.boolean(),
        isPremium: faker.datatype.boolean(),
        codeFiscal: faker.string.alphanumeric(10),
        UserId: user.id
      });
    }
    const createdCompanies = await models.Company.bulkCreate(companies);

    // Create Content Creators
    console.log('Creating content creators...');
    const contentCreators = [];
    const creatorUsers = createdUsers.filter(user => user.role === 'content_creator');
    for (const user of creatorUsers) {
      contentCreators.push({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        bio: faker.person.bio(),
        pricing: faker.commerce.price(),
        portfolio_links: faker.internet.url(),
        location: faker.location.city(),
        verified: faker.datatype.boolean(),
        isPremium: faker.datatype.boolean(),
        UserId: user.id
      });
    }

    const createdCreators = await models.ContentCreator.bulkCreate(contentCreators);
    console.log(`Created ${createdCreators.length} content creators`);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Create Accounts
    console.log('Creating social media accounts...');
    const accounts = [];
    
    for (const creator of createdCreators) {
      const platforms = ['tiktok', 'youtube', 'instagram'];
      const numAccounts = faker.number.int({ min: 1, max: 3 });
      const selectedPlatforms = faker.helpers.arrayElements(platforms, numAccounts);
      
      for (const platform of selectedPlatforms) {
        accounts.push({
          platform: platform,
          token: uuidv4(),
          username: faker.internet.userName(),
          content_creator_id: creator.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    try {
      const createdAccounts = await models.Account.bulkCreate(accounts, {
        validate: true
      });
      console.log(`Created ${createdAccounts.length} social media accounts`);
    } catch (error) {
      console.error('Error creating accounts:', error);
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Create Deals
    const deals = [];
    for (let i = 0; i < 30; i++) {
      const randomCreator = faker.helpers.arrayElement(createdCreators);
      const randomCompany = faker.helpers.arrayElement(createdCompanies);
      deals.push({
        content_creator_id: randomCreator.id,
        company_id: randomCompany.id,
        deal_terms: faker.lorem.paragraph(),
        price: faker.number.float({ min: 100, max: 10000 }),
        status: faker.helpers.arrayElement(['pending', 'accepted', 'rejected', 'completed'])
      });
    }
    const createdDeals = await models.Deal.bulkCreate(deals);

    // Create Contracts with explicit values
    const contracts = [];
    for (let i = 0; i < 10; i++) {
      // Get random company and creator
      const randomCompany = faker.helpers.arrayElement(createdCompanies);
      const randomCreator = faker.helpers.arrayElement(createdCreators);
      
      // Create future start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 30 }));
      
      // Create end date 3-12 months after start date
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + faker.number.int({ min: 3, max: 12 }));

      contracts.push({
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        start_date: startDate,
        end_date: endDate,
        status: faker.helpers.arrayElement(['active', 'completed', 'terminated']),
        payment_terms: `Payment of $${faker.number.int({ min: 1000, max: 50000 })} ${faker.helpers.arrayElement(['monthly', 'quarterly', 'annually'])}`,
        amount: faker.number.float({ min: 1000, max: 50000, precision: 2 }),
        payment_frequency: faker.helpers.arrayElement(['one-time', 'monthly', 'quarterly', 'annually']),
        company_id: randomCompany.id,
        content_creator_id: randomCreator.id,
        deal_id: null, // Optional: can be linked to a deal if needed
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create contracts with explicit error handling
    try {
      const createdContracts = await models.Contract.bulkCreate(contracts, {
        validate: true
      });
      console.log(`Created ${createdContracts.length} contracts`);
      
      // Log the first contract to verify data
      if (createdContracts.length > 0) {
        console.log('Sample contract created:', createdContracts[0].toJSON());
      }
    } catch (error) {
      console.error('Error creating contracts:', error);
      console.error('Validation errors:', error.errors);
      throw error;
    }

    // Create Rooms and Messages
    const rooms = [];
    const messages = [];
    
    for (const deal of createdDeals) {
      // Create a unique room name using UUID
      const roomName = `room_${uuidv4()}`;
      const room = await models.Room.create({
        name: roomName,
        created_at: faker.date.past()
      });

      // Create 5 messages for each room
      for (let i = 0; i < 5; i++) {
        messages.push({
          content: faker.lorem.sentence(),
          created_at: faker.date.recent(),
          RoomId: room.id,
          UserId: faker.helpers.arrayElement([deal.content_creator_id, deal.company_id])
        });
      }
    }

    // Get actual user IDs from database
    const existingUsers = await models.User.findAll({
      attributes: ['id']
    });
    const validUserIds = existingUsers.map(user => user.id);
    
    // Modify messages to only use valid user IDs
    const validMessages = messages.map(message => ({
      ...message,
      UserId: validUserIds[Math.floor(Math.random() * validUserIds.length)]
    }));
    
    // Finally create messages with valid user IDs
    await models.Message.bulkCreate(validMessages);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

async function seedMessages() {
  // First, get all valid user IDs from the database
  const users = await models.User.findAll({
    attributes: ['id']
  });
  const validUserIds = users.map(user => user.id);

  // Get all valid room IDs
  const rooms = await models.Room.findAll({
    attributes: ['id']
  });
  const validRoomIds = rooms.map(room => room.id);

  const messages = [];
  // Generate 5 messages for each room
  for (let roomId of validRoomIds) {
    for (let i = 0; i < 5; i++) {
      messages.push({
        content: faker.lorem.sentence(),
        created_at: faker.date.future(),
        RoomId: roomId,
        // Randomly select a valid user ID
        UserId: validUserIds[Math.floor(Math.random() * validUserIds.length)]
      });
    }
  }

  await models.Message.bulkCreate(messages);
}

// seedDatabase()
// .then(() => console.log('Database seeded successfully'))
// .catch(error => console.error('Seeding failed:', error));

module.exports = seedDatabase;