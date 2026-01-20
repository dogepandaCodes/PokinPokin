import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable body parsing - Stripe needs raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body without 'micro' package
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

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
}

async function handleSuccessfulPayment(session) {
  console.log('Session metadata:', session.metadata);
  console.log('Session amount_total:', session.amount_total);

  const userId = session.metadata?.userId;
  const coins = parseInt(session.metadata?.coins) || 0;
  const bonus = parseInt(session.metadata?.bonus) || 0;
  const totalCoins = coins + bonus;
  const amountPaid = session.amount_total / 100 || 0;

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