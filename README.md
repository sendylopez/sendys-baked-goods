# Sendy's Baked Goods — setup guide

This is your ordering site, wired up to take real card payments through Stripe and ready to host on Vercel.

## What's in here
- `src/App.jsx` — the site (menu, cart, checkout form)
- `api/create-checkout-session.js` — the one backend piece: when someone clicks "Continue to payment," this creates a secure Stripe checkout page and sends them to it
- Everything else is standard project setup (don't worry about it)

## Step 1 — Create your Stripe account
1. Go to stripe.com and sign up (free).
2. You'll land on the Dashboard. In the top right, make sure you're in **Test mode** for now (there's a toggle).
3. Go to **Developers → API keys**. Copy the key that starts with `sk_test_...` (this is your **secret key** — never share it publicly or put it in your website's visible code).
4. Later, once you're ready to take real money, you'll flip to **Live mode** and grab the `sk_live_...` key instead. Same steps.

## Step 2 — Put your project on GitHub
Vercel deploys from GitHub, so:
1. Create a free GitHub account if you don't have one (github.com).
2. Create a new repository (call it `sendys-baked-goods`).
3. Upload this whole folder to it (GitHub's website lets you drag-and-drop files if you don't want to use the command line — use "Add file → Upload files").

## Step 3 — Deploy on Vercel
1. Go to vercel.com and sign up using your GitHub account (free tier is plenty for this).
2. Click **Add New → Project**, and pick the `sendys-baked-goods` repo you just uploaded.
3. Before clicking Deploy, open **Environment Variables** and add:
   - Name: `STRIPE_SECRET_KEY`
   - Value: the `sk_test_...` key from Step 1
4. Click **Deploy**. In about a minute you'll get a live URL like `sendys-baked-goods.vercel.app`.

## Step 4 — Test it
1. Visit your new site, add something to the cart, and go to checkout.
2. On Stripe's payment page, use their test card: `4242 4242 4242 4242`, any future expiry date, any 3-digit CVC.
3. Confirm the order goes through and you can see it in your Stripe Dashboard under **Payments**.

## Step 5 — Go live
1. In Stripe, flip to **Live mode** and grab your `sk_live_...` key.
2. In Vercel, go to your project's **Settings → Environment Variables**, and replace the value of `STRIPE_SECRET_KEY` with the live key.
3. Redeploy (Vercel does this automatically when you save the new variable, or you can trigger it manually under Deployments).
4. You're now taking real payments.

## Optional next steps I can help with later
- **Custom domain** (e.g. sendysbakedgoods.com instead of the vercel.app address) — buy a domain anywhere (Namecheap, Google Domains) and connect it in Vercel's project settings.
- **Order notifications** — right now, orders only show up in your Stripe Dashboard. I can wire up an email or text notification each time someone orders.
- **Sales/tax dashboard** — the tax total math is already built into checkout, but for a running log over time you'll want a lightweight database (Google Sheets or Airtable work well) connected to the checkout function — happy to build that next.
- **Stripe Tax** — instead of a flat 8.1% line item, Stripe has an automatic tax calculation add-on if your sales ever cross city lines. Not needed yet, just worth knowing it exists.

## A note on the current tax line
Right now sales tax is calculated as a flat 8.1% of the subtotal and added as its own Stripe line item. Double check with your tax preparer whether delivery fees should also be taxed in your case — Arizona's TPT rules can vary by how a sale is structured.
