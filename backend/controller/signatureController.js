const { Signature, Contract } = require('../database/connection');

module.exports = {
    createSignature: async (req, res) => {
        try {
            const { contractId } = req.body;
            const userId = req.user.userId; // Assuming you're using authentication middleware

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No signature image provided'
                });
            }

            // Create the signature record
            const signature = await Signature.create({
                signature_data: `../server/uploads/signatures/${req.file.filename}`, // Store the path to the uploaded file
                contractId,
                userId,
                created_at: new Date()
            });

            res.status(201).json({
                success: true,
                message: 'Signature uploaded successfully',
                signature: {
                    id: signature.id,
                    signature_url: signature.signature_data,
                    contractId: signature.contractId,
                    created_at: signature.created_at
                }
            });

        } catch (error) {
            console.error('Error creating signature:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading signature',
                error: error.message
            });
        }
    },

    // Get signature by contract ID
    getSignatureByContract: async (req, res) => {
        try {
            const { contractId } = req.params;
            
            const signature = await Signature.findOne({
                where: { contractId },
                include: [
                    {
                        model: Contract,
                        as: 'contract'
                    }
                ]
            });

            if (!signature) {
                return res.status(404).json({
                    success: false,
                    message: 'Signature not found for this contract'
                });
            }

            res.status(200).json({
                success: true,
                signature
            });

        } catch (error) {
            console.error('Error fetching signature:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching signature',
                error: error.message
            });
        }
    }
};

