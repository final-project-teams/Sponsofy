const { Contract, Company, User, Deal, ContentCreator } = require("../database/connection");
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');

module.exports = {
  verifyContract: async (req, res) => {
    try {
      const { serialNumber } = req.params;

      const deal = await Deal.findOne({
        include: [
          {
            model: Contract,
            where: { serialNumber },
            include: [{
              model: Company,
              include: [{
                model: User,
                as: 'user',
                attributes: ['username', 'email']
              }]
            }]
          },
          {
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [{
              model: User,
              as: 'user',
              attributes: ['username', 'email']
            }]
          }
        ]
      });

      if (!deal || !deal.Contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        contract: {
          id: deal.Contract.id,
          serialNumber: deal.Contract.serialNumber,
          title: deal.Contract.title,
          status: deal.Contract.status,
          createdAt: deal.Contract.createdAt,
          budget: deal.Contract.budget,
          rank: deal.Contract.rank,
          dealStatus: deal.status,
          company: {
            name: deal.Contract.Company?.name,
            username: deal.Contract.Company?.user?.username,
            email: deal.Contract.Company?.user?.email,
            industry: deal.Contract.Company?.industry,
            verified: deal.Contract.Company?.verified
          },
          contentCreator: {
            username: deal.ContentCreatorDeals?.user?.username,
            email: deal.ContentCreatorDeals?.user?.email,
            verified: deal.ContentCreatorDeals?.verified,
            category: deal.ContentCreatorDeals?.category
          }
        }
      });

    } catch (error) {
      console.error('Error verifying contract:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying contract',
        error: error.message
      });
    }
  },

  processQRCode: async (req, res) => {
    try {
      if (!req.body.image) {
        return res.status(400).json({
          success: false,
          message: 'No image provided'
        });
      }

      // Remove the data:image/jpeg;base64, prefix if present
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      return new Promise((resolve, reject) => {
        Jimp.read(imageBuffer)
          .then(image => {
            const qr = new QrCode();
            
            qr.callback = async (err, value) => {
              if (err) {
                console.error('QR read error:', err);
                return res.status(400).json({
                  success: false,
                  message: 'Error reading QR code'
                });
              }

              if (!value || !value.result) {
                return res.status(400).json({
                  success: false,
                  message: 'No QR code found in image'
                });
                }
                
                const theString = value.result;   
                const resul = JSON.parse(theString);
              // The QR code data should be the serial number
              const serialNumber = resul.serialNumber.trim(); // Add trim() to remove any whitespace
              console.log('Extracted Serial Number:', serialNumber);

              try {
                // First try to find the contract directly to verify it exists
                const contract = await Contract.findOne({
                  where: { serialNumber}
                });

                console.log('Contract found:', contract ? 'Yes' : 'No');

                if (!contract) {
                  return res.status(404).json({
                    success: false,
                    message: `Contract not found with serial number: ${serialNumber}`
                  });
                }

                // If contract exists, proceed with the full deal lookup
                const deal = await Deal.findOne({
                  include: [
                    {
                      model: Contract,
                      where: { serialNumber },
                      include: [{
                        model: Company,
                        include: [{
                          model: User,
                          as: 'user',
                          attributes: ['username', 'email']
                        }]
                      }]
                    },
                    {
                      model: ContentCreator,
                      as: 'ContentCreatorDeals',
                      include: [{
                        model: User,
                        as: 'user',
                        attributes: ['username', 'email']
                      }]
                    }
                  ]
                });

                if (!deal || !deal.Contract) {
                  return res.status(404).json({
                    success: false,
                    message: 'Deal not found for this contract'
                  });
                }

                return res.json({
                  success: true,
                  contract: {
                    id: deal.Contract.id,
                    serialNumber: deal.Contract.serialNumber,
                    title: deal.Contract.title,
                    status: deal.Contract.status,
                    createdAt: deal.Contract.createdAt,
                    budget: deal.Contract.budget,
                    rank: deal.Contract.rank,
                    dealStatus: deal.status,
                    company: {
                      name: deal.Contract.Company?.name,
                      username: deal.Contract.Company?.user?.username,
                      email: deal.Contract.Company?.user?.email,
                      industry: deal.Contract.Company?.industry,
                      verified: deal.Contract.Company?.verified
                    },
                    contentCreator: {
                      username: deal.ContentCreatorDeals?.user?.username,
                      email: deal.ContentCreatorDeals?.user?.email,
                      verified: deal.ContentCreatorDeals?.verified,
                      category: deal.ContentCreatorDeals?.category
                    }
                  }
                });
              } catch (error) {
                console.error('Database lookup error:', error);
                return res.status(500).json({
                  success: false,
                  message: 'Error looking up contract',
                  error: error.message
                });
              }
            };

            qr.decode(image.bitmap);
          })
          .catch(err => {
            console.error('Error reading image:', err);
            return res.status(400).json({
              success: false,
              message: 'Error processing image'
            });
          });
      });

    } catch (error) {
      console.error('Error processing QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing QR code',
        error: error.message
      });
    }
  }
};

