const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ensure you have your Stripe secret key in your environment variables
const { Payment } = require('../database/connection')

const paymentController = {
  // Step 1: Create Escrow Payment Intent
  createEscrowPayment: async (req, res) => {
    try {
      const { contractId, amount, userId, currency = 'usd' } = req.body;

      // Create payment intent with manual capture for escrow
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
        capture_method: 'manual', // Enables escrow functionality
        metadata: { 
          contractId,
          userId,
          type: 'escrow'
        }
      });

      // Record the escrow payment
      const payment = await Payment.create({
        paymentId: paymentIntent.id,
        amount: Math.round(amount * 100),
        currency,
        status: 'escrow_pending',
        userId,
        contractId
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id
      });
    } catch (error) {
      console.error('Escrow creation error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Step 2: Confirm Escrow Payment
  confirmEscrowPayment: async (req, res) => {
    try {
      const { paymentId } = req.body;

      const payment = await Payment.findOne({
        where: { paymentId }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status to held in escrow
      await payment.update({ status: 'escrow_held' });

      res.json({
        success: true,
        message: 'Payment held in escrow',
        status: payment.status
      });
    } catch (error) {
      console.error('Escrow confirmation error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Step 3: Release Payment to Creator
  releasePayment: async (req, res) => {
    try {
      const { paymentId, contractId } = req.body;

      const payment = await Payment.findOne({
        where: { paymentId, status: 'escrow_held' }
      });

      if (!payment) {
        throw new Error('No escrow payment found');
      }

      // Capture the held payment
      const capturedPayment = await stripe.paymentIntents.capture(paymentId);

      // Update payment status
      await payment.update({
        status: 'completed',
        releasedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Payment released to creator',
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status
        }
      });
    } catch (error) {
      console.error('Payment release error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Step 4: Handle Disputes/Refunds
  refundPayment: async (req, res) => {
    try {
      const { paymentId, reason } = req.body;

      const payment = await Payment.findOne({
        where: { paymentId }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentId,
        reason: reason || 'requested_by_customer'
      });

      // Update payment status
      await payment.update({
        status: 'refunded',
        refundReason: reason
      });

      res.json({
        success: true,
        message: 'Payment refunded successfully',
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status
        }
      });
    } catch (error) {
      console.error('Refund error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get payment status and details
  getPaymentStatus: async (req, res) => {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findOne({
        where: { paymentId }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      res.json({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          createdAt: payment.createdAt,
          releasedAt: payment.releasedAt
        }
      });
    } catch (error) {
      console.error('Payment status error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

module.exports = paymentController;