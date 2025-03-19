const { Signature } = require('../database/connection');

module.exports = {
    createSignature: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No signature image provided'
                });
            }

            // Get userId from the authenticated user
            const userId = req.user.userId; // Make sure your auth middleware sets this

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Create the signature record with userId
            const signature = await Signature.create({
                signature_data: `/uploads/${req.file.filename}`,
                userId: userId, // Add the userId
                created_at: new Date()
            });

            res.status(201).json({
                success: true,
                message: 'Signature uploaded successfully',
                signature: {
                    id: signature.id,
                    signature_url: signature.signature_data,
                    userId: signature.userId,
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

    // Get signatures for current user
    getUserSignatures: async (req, res) => {
        try {
            const userId = req.user.userId;

            const signatures = await Signature.findAll({
                where: { userId },
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({
                success: true,
                signatures
            });

        } catch (error) {
            console.error('Error fetching signatures:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching signatures',
                error: error.message
            });
        }
    },

    // Get all signatures
    getAllSignatures: async (req, res) => {
        try {
            const signatures = await Signature.findAll({
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({
                success: true,
                signatures
            });

        } catch (error) {
            console.error('Error fetching signatures:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching signatures',
                error: error.message
            });
        }
    },

    // Get signature by ID
    getSignatureById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const signature = await Signature.findByPk(id);

            if (!signature) {
                return res.status(404).json({
                    success: false,
                    message: 'Signature not found'
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
    },

    // Delete signature
    deleteSignature: async (req, res) => {
        try {
            const { id } = req.params;
            
            const signature = await Signature.findByPk(id);
            
            if (!signature) {
                return res.status(404).json({
                    success: false,
                    message: 'Signature not found'
                });
            }

            await signature.destroy();

            res.status(200).json({
                success: true,
                message: 'Signature deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting signature:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting signature',
                error: error.message
            });
        }
    }
};

