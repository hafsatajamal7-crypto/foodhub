import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Clock3, MapPin, Minus, Plus, Search, ShoppingBag, Star, UtensilsCrossed, X } from 'lucide-react';
import { categories, foods as demoFoods, formatPrice, imageUrl, restaurants as demoRestaurants } from './data';
import { useCart } from './context/CartContext';
import api from './services/api';

function Image({ id, alt, className = '' }) {
  const src = typeof id === 'string' && id.startsWith('http') ? id : imageUrl(id);
  return <img className={className} src={src} alt={alt} loading="lazy" />;
}

function Header({ onCart, onSignIn, user, onSignOut }) {
  const { count } = useCart();
  return (
    <header className="site-header">
      <div className="topline"><span>GOOD FOOD, GOOD MOOD</span><span className="topline-right"><MapPin size={13} /> Delivering to <b>Karachi, Pakistan</b><button className="change-location">Change</button></span></div>
      <div className="nav-wrap">
        <Link to="/" className="wordmark" aria-label="FoodHub home"><span className="brand-mark" aria-hidden="true"><UtensilsCrossed size={17} strokeWidth={2.4} /><i /></span><span>Food<span className="wordmark-accent">Hub</span></span></Link>
        <nav className="main-nav" aria-label="Main navigation"><a className="active" href="#home">Home</a><a href="#restaurants">Restaurants</a><a href="#menu">Explore menu</a><a href="#about">Our story</a></nav>
        <div className="nav-actions"><button className="icon-button search-nav" aria-label="Search" onClick={() => document.getElementById('food-search')?.focus()}><Search size={19} /></button><button className="cart-button" onClick={onCart}><ShoppingBag size={18} /><span>Bag</span>{count > 0 && <b className="cart-count">{count}</b>}</button>{user ? <button className="sign-in" onClick={onSignOut}>{user.name.split(' ')[0]} · Log out</button> : <button className="sign-in" onClick={onSignIn}>Sign in <ArrowUpRight size={14} /></button>}</div>
      </div>
    </header>
  );
}

function FoodCard({ food, restaurants, onAdd }) {
  return (
    <article className="food-card">
      <div className="food-image-wrap"><Image id={food.image} alt={food.name} className="food-image" />{food.tag && <span className="food-tag">{food.tag}</span>}<button className="quick-add" aria-label={`Add ${food.name} to bag`} onClick={() => onAdd(food)}><Plus size={19} /></button></div>
      <div className="food-copy"><div className="food-name-row"><h3>{food.name}</h3><span className="rating"><Star size={13} fill="currentColor" /> {food.rating}</span></div><p>{food.description}</p><div className="food-bottom"><span className="food-restaurant">{restaurants.find((place) => place.id === food.restaurantId)?.name}</span><b>{formatPrice(food.price)}</b></div></div>
    </article>
  );
}

function RestaurantCard({ restaurant }) {
  return (
    <article className="restaurant-card"><div className="restaurant-photo"><Image id={restaurant.image} alt={`${restaurant.name} cuisine`} />{restaurant.badge && <span>{restaurant.badge}</span>}<button className="save-restaurant" aria-label={`Save ${restaurant.name}`} onClick={(event) => event.currentTarget.classList.toggle('saved')}>♡</button></div><div className="restaurant-info"><div><h3>{restaurant.name}</h3><p>{restaurant.cuisine}</p></div><div className="restaurant-rating"><Star size={14} fill="currentColor" />{restaurant.rating}</div></div><div className="restaurant-meta"><span><Clock3 size={14} />{restaurant.time}</span><i /> <span>{restaurant.fee} delivery</span><a href="#menu" aria-label={`Explore ${restaurant.name}`}><ArrowUpRight size={17} /></a></div></article>
  );
}

function CartDrawer({ open, onClose, user, onRequireAuth }) {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;
  const delivery = items.length ? Number(items[0].deliveryFee || 0) : 0;
  const tax = subtotal * 0.08;
  async function placeOrder(event) {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      await api.post('/orders', { items: items.map((item) => ({ food: item.id, quantity: item.quantity })), deliveryAddress: address, phone, paymentMethod: 'Cash on Delivery' });
      clearCart();
      setCheckout(false);
      onClose();
      window.alert('Order placed. You can track it from your account.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not place the order. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" aria-label="Your bag">
        <div className="drawer-head"><div><span className="eyebrow">YOUR ORDER</span><h2>Your bag <span>({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button className="close-button" aria-label="Close bag" onClick={onClose}><X /></button></div>
        {items.length === 0 ? <div className="empty-cart"><span className="empty-icon"><ShoppingBag /></span><h3>Your bag is taking a breather</h3><p>Find something delicious and it’ll show up here.</p><button className="dark-button" onClick={onClose}>Explore the menu <ArrowRight size={16} /></button></div> : <>
          <div className="cart-items">{items.map((item) => <div className="cart-line" key={item.id}><Image id={item.image} alt={item.name} /><div className="cart-line-copy"><b>{item.name}</b><span>{formatPrice(item.price)}</span><div className="qty-control"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button><b>{item.quantity}</b><button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button></div></div><button className="remove-line" onClick={() => removeFromCart(item.id)}>Remove</button></div>)}</div>
          {checkout ? <form className="cart-summary checkout-form" onSubmit={placeOrder}><label>Delivery address<input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, city, postal code" /></label><label>Phone number<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your contact number" /></label><div className="payment-note">Cash on delivery <span>Pay when your food arrives</span></div>{message && <p className="form-error">{message}</p>}<div className="summary-total"><span>Total · COD</span><b>{formatPrice(subtotal + delivery + tax)}</b></div><button className="checkout-button" disabled={submitting}>{submitting ? 'Placing order…' : 'Place order'} <ArrowRight size={17} /></button><button type="button" className="checkout-back" onClick={() => setCheckout(false)}>Back to bag</button></form> : <div className="cart-summary"><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery</span><b>{formatPrice(delivery)}</b></div><div><span>Estimated tax</span><b>{formatPrice(tax)}</b></div><div className="summary-total"><span>Total</span><b>{formatPrice(subtotal + delivery + tax)}</b></div><button className="checkout-button" onClick={() => { if (!user) { onRequireAuth(); return; } setAddress(user.address || ''); setPhone(user.phone || ''); setCheckout(true); }}>Go to checkout <ArrowRight size={17} /></button><p className="checkout-note">Cash on delivery · Your total is confirmed by the restaurant.</p></div>}
        </>}
      </aside>
    </div>
  );
}

function AuthDialog({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/auth/${mode === 'login' ? 'login' : 'register'}`, { name, email, password, phone });
      localStorage.setItem('foodhub-token', data.token);
      localStorage.setItem('foodhub-user', JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="overlay auth-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="auth-dialog"><button className="close-button auth-close" aria-label="Close sign in" onClick={onClose}><X /></button><span className="eyebrow">WELCOME TO FOODHUB</span><h2>{mode === 'login' ? 'Good to see you.' : 'Come on in.'}</h2><p>{mode === 'login' ? 'Sign in to finish your order.' : 'Create an account to order from nearby favorites.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>}<label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label>Password<input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>{mode === 'register' && <label>Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></label>}{error && <p className="form-error">{error}</p>}<button className="checkout-button" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button></form><button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'New to FoodHub? Create an account' : 'Already have an account? Sign in'}</button></section></div>;
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All food');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodhub-user') || 'null'); }
    catch { return null; }
  });
  const [restaurants, setRestaurants] = useState(demoRestaurants);
  const [foods, setFoods] = useState(demoFoods);
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/restaurants'), api.get('/foods')]).then(([restaurantResponse, foodResponse]) => {
      if (!active) return;
      const restaurantData = restaurantResponse.data.restaurants || [];
      setRestaurants(restaurantData.map((restaurant) => ({
        id: restaurant._id,
        name: restaurant.name,
        cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(' · ') : restaurant.cuisine,
        rating: Number(restaurant.rating || 0).toFixed(1),
        time: restaurant.deliveryTime,
        fee: formatPrice(restaurant.deliveryFee),
        image: restaurant.coverImage || restaurant.logo,
        badge: '',
      })));
      setFoods((foodResponse.data.foods || []).map((food) => ({
        id: food._id,
        restaurantId: food.restaurant?._id,
        name: food.name,
        category: food.category?.name || 'All food',
        description: food.description,
        price: Number(food.price),
        deliveryFee: Number(food.restaurant?.deliveryFee || 0),
        rating: Number(food.rating || 0).toFixed(1),
        image: food.image,
        tag: '',
      })));
    }).catch(() => {}).finally(() => { active = false; });
    return () => { active = false; };
  }, []);

  const filteredFoods = useMemo(() => foods.filter((food) => {
    const matchesCategory = activeCategory === 'All food' || food.category === activeCategory;
    const query = search.trim().toLowerCase();
    const restaurant = restaurants.find((place) => place.id === food.restaurantId);
    const matchesSearch = !query || `${food.name} ${food.description} ${restaurant?.name} ${food.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }), [activeCategory, search]);

  return (
    <>
      <Header onCart={() => setCartOpen(true)} onSignIn={() => setAuthOpen(true)} user={user} onSignOut={() => { localStorage.removeItem('foodhub-token'); localStorage.removeItem('foodhub-user'); setUser(null); }} />
      <main>
        <section className="hero-section" id="home"><div className="hero-content"><div className="hero-kicker"><span className="kicker-dot" /> YOUR NEIGHBORHOOD, ON A PLATE</div><h1>A little joy.<br /><em>Delivered.</em></h1><p>Good food from the places you love, brought right to your door.</p><div className="hero-search"><Search size={19} /><input id="food-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try ‘crispy tofu’ or ‘pasta’" aria-label="Search food and restaurants" /><button onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>Find food <ArrowRight size={17} /></button></div><div className="hero-footnote"><span><span className="mini-avatars">●●●</span> Loved around the corner</span><span className="hero-delivery"><Clock3 size={14} /> Around 25 min</span></div></div><div className="hero-art"><div className="hero-image-frame"><Image id="photo-1547592180-85f173990554" alt="Colorful fresh lunch bowl" /><div className="image-caption"><span>Made fresh.<br />Made for you.</span><span className="caption-arrow"><ArrowDownRight size={23} /></span></div></div><div className="hero-stamp"><span>THE</span><b>GOOD<br />STUFF</b><span>IS CLOSE</span><i>✳</i></div><div className="hero-scribble">a little<br />closer <span>↗</span></div></div><div className="hero-bottom-line"><span>01 / 04</span><div><i /><i /><i /><i /></div><span>SCROLL TO TASTE</span></div></section>

        <section className="category-section section-shell"><div className="section-heading compact-heading"><div><span className="eyebrow">WHAT SOUNDS GOOD?</span><h2>Pick your craving<span className="heading-period">.</span></h2></div><a className="text-link" href="#menu">See everything <ArrowRight size={16} /></a></div><div className="category-list" role="tablist" aria-label="Food categories">{categories.map((category) => <button className={`category-pill ${category.color} ${activeCategory === category.name ? 'selected' : ''}`} key={category.name} role="tab" aria-selected={activeCategory === category.name} onClick={() => { setActiveCategory(category.name); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><span>{category.icon}</span>{category.name}</button>)}</div></section>

        <section className="restaurant-section" id="restaurants"><div className="section-shell"><div className="section-heading"><div><span className="eyebrow">GOOD PEOPLE, GREAT FOOD</span><h2>Neighborhood favorites<span className="heading-period">.</span></h2><p className="section-intro">The places that make this neighborhood taste like home.</p></div><a className="text-link" href="#restaurants">All restaurants <ArrowRight size={16} /></a></div><div className="restaurant-grid">{restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div></div></section>

        <section className="menu-section section-shell" id="menu"><div className="section-heading"><div><span className="eyebrow">A VERY GOOD PLACE TO START</span><h2>{search ? 'Your search, served' : activeCategory === 'All food' ? 'A few fan favorites' : `${activeCategory}, coming right up`}<span className="heading-period">.</span></h2><p className="section-intro">Made with care by kitchens just around the corner.</p></div><span className="menu-count">{filteredFoods.length.toString().padStart(2, '0')} DISHES</span></div>{filteredFoods.length ? <div className="food-grid">{filteredFoods.map((food) => <FoodCard key={food.id} food={food} restaurants={restaurants} onAdd={(item) => { addToCart(item); setCartOpen(true); }} />)}</div> : <div className="no-results"><span>✳</span><h3>Nothing on the menu just yet</h3><p>Try another search or switch up your craving.</p><button className="text-link" onClick={() => { setSearch(''); setActiveCategory('All food'); }}>Show all food <ArrowRight size={16} /></button></div>}</section>

        <section className="neighborhood-section" id="about"><div className="neighborhood-photo"><Image id="photo-1555939594-58d7cb561ad1" alt="Friends sharing a meal together" /></div><div className="neighborhood-copy"><span className="eyebrow">MORE THAN A DELIVERY</span><h2>Good food<br />brings us <em>closer.</em></h2><p>We’re here for the neighborhood spots, the family recipes, the little places doing something special. Order local, eat well, keep it close.</p><a className="story-link" href="#restaurants">Meet your neighborhood <ArrowUpRight size={16} /></a><span className="story-doodle">made with<br />a little love <b>♡</b></span></div></section>
      </main>
      <footer className="site-footer"><Link to="/" className="wordmark"><span className="brand-mark" aria-hidden="true"><UtensilsCrossed size={15} strokeWidth={2.4} /><i /></span><span>Food<span className="wordmark-accent">Hub</span></span></Link><span>Good food, around the corner.</span><div><a href="#restaurants">Restaurants</a><a href="#menu">Menu</a><a href="#about">About</a></div><span className="copyright">© 2026 FoodHub</span></footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} user={user} onRequireAuth={() => setAuthOpen(true)} />
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onSuccess={(nextUser) => { setUser(nextUser); setAuthOpen(false); }} />}
    </>
  );
}
