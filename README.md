# PokinPokin - Complete Setup Guide

## Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhook testing)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/pokinpokin.git
cd pokinpokin
```

---

## Step 2: Backend Setup

```bash
# Navigate to backend folder
cd pokinpokin-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configure Backend `.env`

Edit `.env` with your credentials:

```env
# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx   # Get this from Step 5

# Supabase (get from Supabase Dashboard → Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx  # Use service_role key, NOT anon key

# App
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## Step 3: Frontend Setup

```bash
# Open a new terminal, navigate to frontend folder
cd pokinpokin-frontend   # or wherever your Vite app is

# Install dependencies
npm install

# Create environment file (if not exists)
touch .env
```

### Configure Frontend `.env`

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx

# Backend API
VITE_API_URL=http://localhost:3001
```

---

## Step 4: Database Setup (Supabase)

Make sure your Supabase database has these tables:

### `profiles` table

| Column     | Type        | Notes                                  |
| ---------- | ----------- | -------------------------------------- |
| id         | uuid        | Primary key, references auth.users(id) |
| email      | text        |                                        |
| points     | int4        | Default: 0                             |
| coins      | int4        | Default: 0                             |
| created_at | timestamptz |                                        |

### `purchases` table

| Column          | Type        | Notes                     |
| --------------- | ----------- | ------------------------- |
| id              | uuid        | Primary key               |
| user_id         | uuid        | References auth.users(id) |
| purchase_time   | timestamptz |                           |
| token_amount    | int4        |                           |
| purchase_amount | int4        | Amount in cents           |

If you need to add the `user_id` column:

```sql
ALTER TABLE purchases
ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

---

## Step 5: Stripe Webhook Setup (Local Development)

### Install Stripe CLI

```bash
# Mac
brew install stripe/stripe-cli/stripe

# Windows (download from)
# https://github.com/stripe/stripe-cli/releases/latest

# Or via npm
npm install -g stripe
```

### Login and Start Webhook Forwarding

```bash
# Login (first time only - opens browser)
stripe login

# Start forwarding webhooks to your local server
stripe listen --forward-to localhost:3001/webhook
```

You'll see output like:

```
> Ready! Your webhook signing secret is whsec_12345abcdefg...
```

**Copy that `whsec_...` value and paste it into your backend `.env` as `STRIPE_WEBHOOK_SECRET`**

---

## Step 6: Run the Application

You need **3 terminal windows**:

### Terminal 1 - Backend

```bash
cd pokinpokin-backend
npm run dev
```

Should show: `Server running on port 3001`

### Terminal 2 - Stripe Webhook Listener

```bash
stripe listen --forward-to localhost:3001/webhook
```

Should show: `Ready! Your webhook signing secret is whsec_...`

### Terminal 3 - Frontend

```bash
cd pokinpokin-frontend
npm run dev
```

Should show: `Local: http://localhost:5173`

---

## Step 7: Test the Application

1. Open http://localhost:5173
2. Create an account or log in
3. Go to Pricing section and click "Purchase" on any package
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
5. Complete the payment
6. You should see the success page and coins added to your account

---

## Troubleshooting

### "Failed to create checkout session"

- Check backend is running on port 3001
- Verify `STRIPE_SECRET_KEY` is correct in backend `.env`

### Webhook not working (coins not credited)

- Make sure `stripe listen` is running
- Check `STRIPE_WEBHOOK_SECRET` matches the one shown by Stripe CLI
- Look at backend terminal for error logs

### "Failed to fetch user profile"

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Make sure you're using the **service_role** key (not anon key) in backend

### CORS errors

- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly

---

## Quick Reference - All Commands

```bash
# Backend
cd pokinpokin-backend
npm install
npm run dev

# Frontend
cd PokinPokin
npm install
npm run dev

# Stripe (separate terminal)
stripe login          # First time only
stripe listen --forward-to localhost:3001/webhook
```

---

## Test Card Numbers

| Card Number         | Result             |
| ------------------- | ------------------ |
| 4242 4242 4242 4242 | Success            |
| 4000 0000 0000 0002 | Declined           |
| 4000 0000 0000 9995 | Insufficient funds |

Use any future expiry date and any 3-digit CVC.
