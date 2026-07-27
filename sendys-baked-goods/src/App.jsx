import { useState, useMemo } from "react";
import { ShoppingBag, X, Plus, Minus, Truck, Store, ChevronRight } from "lucide-react";

const TAX_RATE = 0.081; // Sahuarita, AZ combined rate
const MIN_LEAD_DAYS = 7;
const DELIVERY_FEE = 8;

const MENU = [
  {
    id: "bread",
    title: "Bread",
    icon: "bread",
    items: [
      { id: "bread-slice", name: "Bread Slice", price: 3, unit: "slice", flavors: ["Banana Bread", "Cinnamon Nutmeg", "Chocolate Chip"] },
      { id: "bread-loaf", name: "Bread Loaf", price: 15, unit: "loaf", flavors: ["Banana Bread", "Cinnamon Nutmeg", "Chocolate Chip"] },
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    icon: "cookie",
    items: [
      {
        id: "cookie",
        name: "Cookie",
        price: 3,
        unit: "cookie",
        flavors: ["Chocolate Chip", "Oatmeal", "Peanut Butter", "Snicker Doodle", "Sugar Cookie"],
      },
    ],
  },
  {
    id: "cakepops",
    title: "Cake Pops",
    icon: "cakepop",
    items: [
      {
        id: "cakepops-dozen",
        name: "Cake Pops",
        price: 36,
        unit: "dozen",
        flavors: ["Vanilla", "Chocolate", "Red Velvet", "Funfetti", "Strawberry", "Chocolate Chip"],
        addons: [
          { id: "sphere", name: "Sphere / 3D shapes", price: 6 },
          { id: "display", name: "Display packaging", price: 4 },
          { id: "bow", name: "Bow ties", price: 3 },
        ],
      },
    ],
  },
  {
    id: "pretzels",
    title: "Pretzels",
    icon: "pretzel",
    items: [
      {
        id: "pretzels-dozen",
        name: "Chocolate Covered Pretzels",
        price: 20,
        unit: "dozen",
        note: "Includes custom colors and sprinkles. Perfect for parties, favors, and dessert tables.",
      },
    ],
  },
  {
    id: "ricekrispies",
    title: "Rice Krispies",
    icon: "rice",
    items: [
      {
        id: "rice-dozen",
        name: "Chocolate Covered Rice Krispies",
        price: 30,
        unit: "dozen",
        note: "Includes custom colors and sprinkles. Perfect for parties, favors, and dessert tables.",
      },
    ],
  },
];

function money(n) {
  return `$${n.toFixed(2)}`;
}

function Icon({ name }) {
  const common = { width: 30, height: 30, viewBox: "0 0 48 48", fill: "none", stroke: "var(--gold)", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "bread")
    return (
      <svg {...common}>
        <path d="M8 22c0-8 6-13 16-13s16 5 16 13v10a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V22Z" />
        <path d="M8 24h32" />
        <path d="M24 9v6" />
      </svg>
    );
  if (name === "cookie")
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="16" />
        <circle cx="18" cy="19" r="1.6" fill="var(--gold)" />
        <circle cx="29" cy="17" r="1.6" fill="var(--gold)" />
        <circle cx="31" cy="26" r="1.6" fill="var(--gold)" />
        <circle cx="21" cy="29" r="1.6" fill="var(--gold)" />
        <circle cx="16" cy="25" r="1.6" fill="var(--gold)" />
      </svg>
    );
  if (name === "cakepop")
    return (
      <svg {...common}>
        <circle cx="24" cy="16" r="9" />
        <path d="M24 25v18" />
        <path d="M18 12c2-3 10-3 12 0" />
      </svg>
    );
  if (name === "pretzel")
    return (
      <svg {...common}>
        <path d="M14 14c0-4 4-6 7-3l3 4 3-4c3-3 7-1 7 3 0 3-2 5-5 7l-9 8-9-8c-3-2-5-4-5-7Z" />
        <path d="M15 25 12 34" />
        <path d="M33 25l3 9" />
      </svg>
    );
  if (name === "rice")
    return (
      <svg {...common}>
        <rect x="10" y="14" width="28" height="20" rx="3" />
        <circle cx="17" cy="21" r="1.4" fill="var(--gold)" />
        <circle cx="24" cy="26" r="1.4" fill="var(--gold)" />
        <circle cx="31" cy="20" r="1.4" fill="var(--gold)" />
        <circle cx="20" cy="29" r="1.4" fill="var(--gold)" />
        <circle cx="29" cy="29" r="1.4" fill="var(--gold)" />
      </svg>
    );
  return null;
}

export default function App() {
  const [selections, setSelections] = useState({});
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [fulfillment, setFulfillment] = useState("pickup");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", date: "", time: "", notes: "" });
  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + MIN_LEAD_DAYS);
    return d.toISOString().split("T")[0];
  }, []);

  const getSel = (item) => selections[item.id] || { qty: 1, flavor: item.flavors ? item.flavors[0] : null, addons: {} };
  const setSel = (item, patch) => setSelections((s) => ({ ...s, [item.id]: { ...getSel(item), ...patch } }));

  const addToCart = (item) => {
    const sel = getSel(item);
    const addonList = item.addons ? item.addons.filter((a) => sel.addons[a.id]) : [];
    const unitPrice = item.price + addonList.reduce((sum, a) => sum + a.price, 0);
    setCart((c) => [
      ...c,
      {
        cartId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: item.name,
        unit: item.unit,
        qty: sel.qty,
        flavor: sel.flavor,
        addons: addonList.map((a) => a.name),
        unitPrice,
      },
    ]);
    setSel(item, { qty: 1, addons: {} });
    setCartOpen(true);
  };

  const updateQty = (cartId, delta) =>
    setCart((c) => c.map((l) => (l.cartId === cartId ? { ...l, qty: Math.max(1, l.qty + delta) } : l)));
  const removeLine = (cartId) => setCart((c) => c.filter((l) => l.cartId !== cartId));

  const subtotal = useMemo(() => cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0), [cart]);
  const tax = subtotal * TAX_RATE;
  const deliveryFee = fulfillment === "delivery" && cart.length ? DELIVERY_FEE : 0;
  const total = subtotal + tax + deliveryFee;
  const cartCount = cart.reduce((sum, l) => sum + l.qty, 0);

  const isShortNotice = form.date && form.date < minDate;
  const canPlace = form.name.trim() && form.phone.trim() && form.date && (fulfillment === "pickup" || form.address.trim()) && (!isShortNotice || form.notes.trim());

  const placeOrder = async () => {
    setPlacing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, fulfillment, deliveryFee, tax, form }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong starting checkout.");
      window.location.href = data.url; // redirect to Stripe's hosted checkout page
    } catch (e) {
      setErrorMsg(e.message || "Could not start checkout. Please try again.");
      setPlacing(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Jost', sans-serif", background: "var(--cream)", minHeight: "100vh", color: "var(--espresso)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Jost:wght@300;400;500;600&display=swap');
        :root {
          --cream: #FBF6EE;
          --cream-card: #FFFDF8;
          --espresso: #2A1D15;
          --caramel: #A9754C;
          --gold: #B08D46;
          --rose: #BE7B6E;
        }
        * { box-sizing: border-box; }
        .display { font-family: 'Fraunces', serif; }
        .btn { font-family: 'Jost', sans-serif; letter-spacing: 0.03em; cursor: pointer; border: none; transition: transform 0.15s ease, background 0.2s ease, opacity 0.2s ease; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--espresso); color: var(--cream-card); padding: 12px 24px; border-radius: 2px; font-size: 13px; text-transform: uppercase; }
        .btn-primary:hover { background: var(--caramel); }
        .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
        select, input, textarea { font-family: 'Jost', sans-serif; border: 1px solid #DDD3C4; background: var(--cream-card); border-radius: 2px; padding: 9px 10px; font-size: 14px; color: var(--espresso); width: 100%; }
        select:focus, input:focus, textarea:focus { outline: none; border-color: var(--caramel); }
        .card { background: var(--cream-card); border: 1px solid #EFE6D6; position: relative; }
        @media (max-width: 640px) { .menu-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--cream)", borderBottom: "1px solid #EFE6D6" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="display" style={{ fontSize: 22, fontWeight: 600, fontStyle: "italic", color: "var(--caramel)" }}>Sendy's Baked Goods</div>
          <button className="btn" onClick={() => setCartOpen(true)} style={{ background: "transparent", display: "flex", alignItems: "center", gap: 8, color: "var(--espresso)", padding: 6 }} aria-label="Open cart">
            <ShoppingBag size={20} />
            <span style={{ fontSize: 14 }}>{cartCount > 0 ? cartCount : ""}</span>
          </button>
        </div>
      </header>

      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "64px 24px 40px", textAlign: "center" }}>
        <h1 className="display" style={{ fontSize: "clamp(38px, 6vw, 64px)", fontStyle: "italic", fontWeight: 600, lineHeight: 1.05, margin: "0 0 20px" }}>Baked with care,<br />made to order</h1>
        <p style={{ maxWidth: 480, margin: "0 auto", fontSize: 16, color: "#5B4C3E", lineHeight: 1.7 }}>Fresh bread, cookies, cake pops and more &mdash; order ahead for pickup or local delivery.</p>
      </section>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px 80px" }}>
        {MENU.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <Icon name={cat.icon} />
              <h2 className="display" style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>{cat.title}</h2>
            </div>
            <div className="menu-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {cat.items.map((item) => {
                const sel = getSel(item);
                return (
                  <div key={item.id} className="card" style={{ padding: "22px 22px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>{item.name}</h3>
                      <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, color: "var(--caramel)" }}>
                        {money(item.price)}<span style={{ fontSize: 12, color: "#8A7A68" }}> /{item.unit}</span>
                      </span>
                    </div>
                    {item.note && <p style={{ fontSize: 13, color: "#7A6B5A", lineHeight: 1.6, margin: "6px 0 14px" }}>{item.note}</p>}
                    {item.flavors && (
                      <div style={{ marginTop: 12 }}>
                        <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>Flavor</label>
                        <select value={sel.flavor} onChange={(e) => setSel(item, { flavor: e.target.value })}>
                          {item.flavors.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    )}
                    {item.addons && (
                      <div style={{ marginTop: 14 }}>
                        <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 6 }}>Add-ons (per dozen)</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {item.addons.map((a) => (
                            <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
                              <input type="checkbox" style={{ width: "auto" }} checked={!!sel.addons[a.id]} onChange={(e) => setSel(item, { addons: { ...sel.addons, [a.id]: e.target.checked } })} />
                              {a.name} <span style={{ color: "#8A7A68" }}>+{money(a.price)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #E6DBC7", borderRadius: 2 }}>
                        <button className="btn" style={{ background: "transparent", padding: "6px 10px" }} onClick={() => setSel(item, { qty: Math.max(1, sel.qty - 1) })} aria-label="Decrease"><Minus size={14} /></button>
                        <span style={{ fontSize: 14, minWidth: 14, textAlign: "center" }}>{sel.qty}</span>
                        <button className="btn" style={{ background: "transparent", padding: "6px 10px" }} onClick={() => setSel(item, { qty: sel.qty + 1 })} aria-label="Increase"><Plus size={14} /></button>
                      </div>
                      <button className="btn btn-primary" onClick={() => addToCart(item)}>Add</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <footer style={{ borderTop: "1px solid #EFE6D6", padding: "28px 24px", textAlign: "center", fontSize: 12.5, color: "#8A7A68" }}>
        Sendy's Baked Goods &middot; Sahuarita, AZ &middot; Orders taken online, ask about custom requests
      </footer>

      {cartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(42,29,21,0.35)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(400px, 100%)", background: "var(--cream-card)", display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" }}>
            <div style={{ padding: "20px 22px", borderBottom: "1px dashed #DDD3C4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="display" style={{ fontSize: 20, margin: 0 }}>Your order</h2>
              <button className="btn" style={{ background: "transparent" }} onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px" }}>
              {cart.length === 0 && <p style={{ color: "#8A7A68", fontSize: 14, marginTop: 24 }}>Your bag is empty. Add something delicious.</p>}
              {cart.map((line) => (
                <div key={line.cartId} style={{ padding: "16px 0", borderBottom: "1px dashed #E6DBC7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 500 }}>{line.name}</p>
                      {line.flavor && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#8A7A68" }}>{line.flavor}</p>}
                      {line.addons.length > 0 && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#8A7A68" }}>{line.addons.join(", ")}</p>}
                    </div>
                    <button className="btn" style={{ background: "transparent", color: "#A88A6C", padding: 2 }} onClick={() => removeLine(line.cartId)} aria-label="Remove item"><X size={14} /></button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #E6DBC7", borderRadius: 2 }}>
                      <button className="btn" style={{ background: "transparent", padding: "4px 8px" }} onClick={() => updateQty(line.cartId, -1)} aria-label="Decrease"><Minus size={12} /></button>
                      <span style={{ fontSize: 13 }}>{line.qty} {line.unit}{line.qty > 1 ? "s" : ""}</span>
                      <button className="btn" style={{ background: "transparent", padding: "4px 8px" }} onClick={() => updateQty(line.cartId, 1)} aria-label="Increase"><Plus size={12} /></button>
                    </div>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, color: "var(--caramel)" }}>{money(line.unitPrice * line.qty)}</span>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: "18px 22px 24px", borderTop: "1px dashed #DDD3C4" }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 6 }}>Fulfillment</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" onClick={() => setFulfillment("pickup")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", fontSize: 13, borderRadius: 2, border: `1px solid ${fulfillment === "pickup" ? "var(--espresso)" : "#E6DBC7"}`, background: fulfillment === "pickup" ? "var(--espresso)" : "transparent", color: fulfillment === "pickup" ? "var(--cream-card)" : "var(--espresso)" }}><Store size={14} /> Pickup</button>
                    <button className="btn" onClick={() => setFulfillment("delivery")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", fontSize: 13, borderRadius: 2, border: `1px solid ${fulfillment === "delivery" ? "var(--espresso)" : "#E6DBC7"}`, background: fulfillment === "delivery" ? "var(--espresso)" : "transparent", color: fulfillment === "delivery" ? "var(--cream-card)" : "var(--espresso)" }}><Truck size={14} /> Delivery</button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4, color: "#5B4C3E" }}><span>Subtotal</span><span>{money(subtotal)}</span></div>
                {fulfillment === "delivery" && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4, color: "#5B4C3E" }}><span>Delivery</span><span>{money(deliveryFee)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4, color: "#5B4C3E" }}><span>Tax (8.1%)</span><span>{money(tax)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, margin: "10px 0 16px", fontFamily: "'Fraunces', serif" }}><span>Total</span><span style={{ color: "var(--caramel)" }}>{money(total)}</span></div>
                <button className="btn btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Checkout <ChevronRight size={15} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => setCheckoutOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(42,29,21,0.4)" }} />
          <div className="card" style={{ position: "relative", width: "min(480px, 100%)", maxHeight: "88vh", overflowY: "auto", padding: "28px 26px", borderRadius: 3 }}>
            <button className="btn" style={{ background: "transparent", position: "absolute", top: 18, right: 18 }} onClick={() => setCheckoutOpen(false)} aria-label="Close"><X size={18} /></button>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--rose)", marginBottom: 4 }}>{fulfillment === "pickup" ? "Pickup order" : "Delivery order"}</p>
            <h2 className="display" style={{ fontSize: 26, fontStyle: "italic", margin: "0 0 20px" }}>Checkout</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(520) 555-0134" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@email.com" />
                </div>
              </div>
              {fulfillment === "delivery" && (
                <div>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>Delivery address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, Sahuarita, AZ" />
                </div>
              )}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>{fulfillment === "pickup" ? "Pickup date" : "Delivery date"}</label>
                  <input type="date" min={minDate} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  <p style={{ fontSize: 11, color: "#A0907C", margin: "5px 0 0" }}>Orders need at least a week's notice. Need it sooner, or want a date further out? Leave it in the notes below.</p>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>Preferred time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7A68", display: "block", marginBottom: 4 }}>Order notes (optional)</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Allergies, occasion, custom color requests, or your requested date if outside the picker..." />
              </div>
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed #DDD3C4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8A7A68", marginBottom: 3 }}><span>Subtotal</span><span>{money(subtotal)}</span></div>
              {fulfillment === "delivery" && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8A7A68", marginBottom: 3 }}><span>Delivery</span><span>{money(deliveryFee)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8A7A68", marginBottom: 8 }}><span>Tax (8.1%)</span><span>{money(tax)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontFamily: "'Fraunces', serif", marginBottom: 16 }}><span>Total due</span><span style={{ color: "var(--caramel)" }}>{money(total)}</span></div>
              {errorMsg && <p style={{ fontSize: 12.5, color: "#B0433E", marginBottom: 10 }}>{errorMsg}</p>}
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={!canPlace || placing} onClick={placeOrder}>{placing ? "Redirecting to secure checkout..." : "Continue to payment"}</button>
              <p style={{ fontSize: 11.5, color: "#A0907C", textAlign: "center", marginTop: 10 }}>You'll enter your card on Stripe's secure checkout page.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
