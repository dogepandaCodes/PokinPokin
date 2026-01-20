import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const COIN_PACKAGES = {
  starter: { id: 'starter', name: 'Starter Pack', coins: 10, bonus: 0, price: 1000 },
  popular: { id: 'popular', name: 'Player Pack', coins: 20, bonus: 2, price: 2000 },
  premium: { id: 'premium', name: 'Pro Pack', coins: 50, bonus: 10, price: 5000 },
  ultimate: { id: 'ultimate', name: 'Ultimate Pack', coins: 100, bonus: 30, price: 10000 },
};

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { packageId, userId, userEmail } = req.body;

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
}