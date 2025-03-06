const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ensure you have your Stripe secret key in your environment variables
const { Payment } = require('../database/connection'); // Ensure Payment is imported correctly


// Controller function to create a payment intent
const createPaymentIntent = async (req, res) => {
  console.log("Request Body:", req.body); // Log the request body
  console.log("User:", req.user); // Log the user object
  const { amount } = req.body; // Get the amount from the request body
  const userId = req.user?.id; // Use optional chaining to avoid errors
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: 'usd', // Currency
    });

    // Save payment details to the database
    await Payment.create({
      paymentId: paymentIntent.id,
      amount,
      currency: 'usd',
      status: paymentIntent.status,
      userId, // Use the userId variable
    });

    res.status(200).json({ paymentIntent: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
};