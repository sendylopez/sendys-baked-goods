import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart, fulfillment, deliveryFee, tax, form } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    // One Stripe line item per cart line, named with flavor/add-ons for clarity
    const line_items = cart.map((line) => {
      const details = [line.flavor, ...(line.addons || [])].filter(Boolean).join(", ");
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: details ? `${line.name} (${details})` : line.name,
          },
          unit_amount: Math.round(line.unitPrice * 100),
        },
        quantity: line.qty,
      };
    });

    // Delivery fee as its own line item
    if (fulfillment === "delivery" && deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery fee" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Sales tax as its own line item (simple approach — see note in README about Stripe Tax)
    if (tax > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Sales tax (8.1%)" },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: form?.email || undefined,
      metadata: {
        customer_name: form?.name || "",
        customer_phone: form?.phone || "",
        fulfillment: fulfillment || "",
        address: form?.address || "",
        requested_date: form?.date || "",
        requested_time: form?.time || "",
        notes: form?.notes || "",
      },
      success_url: `${origin}/?order=success`,
      cancel_url: `${origin}/?order=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
}
