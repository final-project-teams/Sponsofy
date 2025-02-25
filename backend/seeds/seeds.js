// const { sequelize } = require('../db');
// const Deal = require('../models/deal');
// const ContentCreator = require('../models/contentCreator');
// const Company = require('../models/company');

// const seedDeals = async () => {
//   try {
//     await sequelize.sync({ force: true }); // WARNING: This will drop existing tables!

//     const companies = await Company.findAll();
//     const creators = await ContentCreator.findAll();

//     if (companies.length === 0 || creators.length === 0) {
//       console.log('Please seed companies and content creators first.');
//       return;
//     }

//     const deals = [
//       {
//         deal_type: 'YouTube Video Sponsorship',
//         description: 'Sponsor a dedicated YouTube video featuring our new tech product.',
//         budget: 7000,
//         timeline: '2 weeks',
//       },
//       {
//         deal_type: 'Instagram Post Sponsorship',
//         description: 'A sponsored Instagram post showcasing our fashion brand.',
//         budget: 3000,
//         timeline: '1 week',
//       },
//       {
//         deal_type: 'Twitch Stream Sponsorship',
//         description: 'A live-streamed gaming session featuring our brand’s logo and mentions.',
//         budget: 10000,
//         timeline: '1 month',
//       },
//       {
//         deal_type: 'Podcast Sponsorship',
//         description: 'A sponsored ad read on a popular podcast episode.',
//         budget: 5000,
//         timeline: '3 weeks',
//       },
//       {
//         deal_type: 'TikTok Video Sponsorship',
//         description: 'A viral-style TikTok video promoting our latest app.',
//         budget: 4000,
//         timeline: '10 days',
//       },
//       {
//         deal_type: 'Twitter/X Sponsorship',
//         description: 'A series of branded tweets promoting our product launch.',
//         budget: 2500,
//         timeline: '2 weeks',
//       },
//       {
//         deal_type: 'Event Sponsorship',
//         description: 'Brand integration in a large industry conference or expo.',
//         budget: 20000,
//         timeline: '6 months',
//       },
//       {
//         deal_type: 'Exclusive Long-Term Sponsorship',
//         description: 'A 6-month partnership where the influencer exclusively promotes our brand.',
//         budget: 50000,
//         timeline: '6 months',
//       },
//     ];

//     // Assign each deal to a random company and content creator
//     for (let deal of deals) {
//       await Deal.create({
//         ...deal,
//         CompanyId: companies[Math.floor(Math.random() * companies.length)].id,
//         ContentCreatorId: creators[Math.floor(Math.random() * creators.length)].id,
//       });
//     }

//     console.log('Sponsorship deals seeded successfully!');
//   } catch (error) {
//     console.error('Error seeding sponsorship deals:', error);
//   } finally {
//     process.exit();
//   }
// };

// seedDeals();
