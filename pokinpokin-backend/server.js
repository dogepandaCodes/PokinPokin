import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase with service role key (for backend operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Coin packages configuration (keep in sync with frontend)
const COIN_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    coins: 10,
    bonus: 0,
    price: 1000, // in cents
  },
  popular: {
    id: 'popular',
    name: 'Player Pack',
    coins: 20,
    bonus: 2,
    price: 2000,
  },
  premium: {
    id: 'premium',
    name: 'Pro Pack',
    coins: 50,
    bonus: 10,
    price: 5000,
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate Pack',
    coins: 100,
    bonus: 30,
    price: 10000,
  },
};

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Webhook endpoint needs raw body - must be before express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      await handleSuccessfulPayment(session);
    } catch (err) {
      console.error('Error processing payment:', err);
      return res.status(500).send('Error processing payment');
    }
  }

  res.json({ received: true });
});

// Parse JSON for all other routes
app.use(express.json());

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { packageId, userId, userEmail } = req.body;

  // Validate package
  const selectedPackage = COIN_PACKAGES[packageId];
  if (!selectedPackage) {
    return res.status(400).json({ error: 'Invalid package selected' });
  }

  if (!userId || !userEmail) {
    return res.status(400).json({ error: 'User must be logged in' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.name,
              description: `${selectedPackage.coins} coins${selectedPackage.bonus > 0 ? ` + ${selectedPackage.bonus} bonus coins` : ''}`,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/#pricing`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        packageId: packageId,
        coins: String(selectedPackage.coins),
        bonus: String(selectedPackage.bonus),
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Verify payment status (for success page)
app.get('/verify-payment/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      res.json({
        success: true,
        packageId: session.metadata.packageId,
        coins: parseInt(session.metadata.coins) + parseInt(session.metadata.bonus),
      });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
  // Debug: Log the full session metadata
  console.log('Session metadata:', session.metadata);
  console.log('Session amount_total:', session.amount_total);
  
  const userId = session.metadata?.userId;
  const coins = parseInt(session.metadata?.coins) || 0;
  const bonus = parseInt(session.metadata?.bonus) || 0;
  const totalCoins = coins + bonus;
  const amountPaid = session.amount_total/100 || 0;

  console.log(`Processing payment - userId: ${userId}, coins: ${coins}, bonus: ${bonus}, total: ${totalCoins}, amount: ${amountPaid}`);

  if (!userId) {
    throw new Error('No userId in session metadata');
  }

  // 1. Get current user coins
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', userId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
  }

  // 2. Update user coins
  const newCoins = (profile.coins || 0) + totalCoins;
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ coins: newCoins })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Failed to update coins: ${updateError.message}`);
  }

  // 3. Record the purchase
  const { data: purchaseData, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      id: crypto.randomUUID(),
      user_id: userId,
      purchase_time: new Date().toISOString(),
      token_amount: totalCoins,
      purchase_amount: amountPaid,
    })
    .select();

  if (purchaseError) {
    console.error('Failed to record purchase:', purchaseError.message);
  } else {
    console.log('Purchase recorded:', purchaseData);
  }

  console.log(`Successfully credited ${totalCoins} coins to user ${userId}`);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});