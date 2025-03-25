const router = require("express").Router();
const { Media, Term } = require("../database/connection");

// Content submission route
router.post('/content/submit', async (req, res) => {
    try {
        const { termId, contractId, mediaData } = req.body;
        
        // Create media entry
        const media = await Media.create({
            ...mediaData,
            TermId: termId // Ensure proper association
        });
        
        // Update term status
        await Term.update(
            { status: 'submitted' },
            { where: { id: termId } }
        );

        res.json({
            success: true,
            mediaId: media.id,
            message: 'Content submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit content'
        });
    }
});

router.post('/content/approve', async (req, res) => {
    try {
        const { termId } = req.body;
        
        await Term.update(
            { status: 'content_approved' },
            { where: { id: termId } }
        );

        res.json({
            success: true,
            message: 'Content approved successfully'
        });
    } catch (error) {
        console.error('Error approving content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve content'
        });
    }
});

router.post('/content/reject', async (req, res) => {
    try {
        const { termId, reason } = req.body;
        
        await Term.update(
            { 
                status: 'rejected',
                rejection_reason: reason 
            },
            { where: { id: termId } }
        );

        res.json({
            success: true,
            message: 'Content rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject content'
        });
    }
});
router.get('/terms/:contractId', async (req, res) => {
    try {
      const terms = await Term.findAll({
        where: { ContractId: req.params.contractId },
        include: [{
          model: Media,
          as: 'submissions',
          attributes: ['file_url', 'platform', 'media_type']
        }]
      });
      res.json(terms);
    } catch (error) {
      console.error('Error fetching terms:', error);
      res.status(500).json({ message: 'Failed to fetch terms' });
    }
  });
// Export the router
module.exports = router;