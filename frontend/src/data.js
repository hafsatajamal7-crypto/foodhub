export const categories = [
  { name: 'All food', icon: '✦', color: 'mint' },
  { name: 'Pizza', icon: '🍕', color: 'rose' },
  { name: 'Burgers', icon: '🍔', color: 'yellow' },
  { name: 'Biryani', icon: '🍛', color: 'orange' },
  { name: 'Pakistani', icon: '🍲', color: 'orange' },
  { name: 'Continental', icon: '🥩', color: 'mint' },
  { name: 'Asian', icon: '🍜', color: 'blue' },
  { name: 'Desserts', icon: '🍰', color: 'pink' },
  { name: 'Drinks', icon: '🥤', color: 'lavender' },
];

export const restaurants = [
  { id: 'r1', name: 'The Green Fork', cuisine: 'Modern healthy · Bowls', rating: '4.9', time: '20–30 min', fee: 'PKR 150', deliveryFee: 150, image: 'photo-1512621776951-a57141f2eefd', badge: 'LOCAL FAVORITE' },
  { id: 'r2', name: 'Pasta Social Club', cuisine: 'Italian · Handmade pasta', rating: '4.8', time: '25–35 min', fee: 'PKR 100', deliveryFee: 100, image: 'photo-1473093295043-cdd812d0e601', badge: 'FREE DELIVERY' },
  { id: 'r3', name: 'Little Seoul', cuisine: 'Korean · Asian fusion', rating: '4.7', time: '30–40 min', fee: 'PKR 200', deliveryFee: 200, image: 'photo-1498837167922-ddd27525d352', badge: '' },
  { id: 'r4', name: 'Karachi Tandoor', cuisine: 'Pakistani · BBQ & Karahi', rating: '4.9', time: '25–35 min', fee: 'PKR 180', deliveryFee: 180, image: 'photo-1544025162-d76694265947', badge: 'LOCAL FAVORITE' },
  { id: 'r5', name: 'The Continental Table', cuisine: 'Continental · Grill & comfort', rating: '4.8', time: '30–40 min', fee: 'PKR 150', deliveryFee: 150, image: 'photo-1547592180-85f173990554', badge: 'CHEF’S PICK' },
];

export const foods = [
  { id: 'f1', restaurantId: 'r1', name: 'Avocado crunch bowl', category: 'All food', description: 'Green goddess dressing, pickled onion, toasted seeds', price: 1850, deliveryFee: 150, rating: '4.9', image: 'photo-1512621776951-a57141f2eefd', tag: 'BESTSELLER' },
  { id: 'f2', restaurantId: 'r2', name: 'Pesto rigatoni', category: 'Continental', description: 'Basil pesto, parmesan, roasted cherry tomatoes', price: 2200, deliveryFee: 100, rating: '4.8', image: 'photo-1473093295043-cdd812d0e601', tag: 'CHEF’S PICK' },
  { id: 'f3', restaurantId: 'r3', name: 'Crispy tofu bao', category: 'Asian', description: 'Sticky gochujang, crunchy slaw, sesame', price: 1450, deliveryFee: 200, rating: '4.7', image: 'photo-1498837167922-ddd27525d352', tag: '' },
  { id: 'f4', restaurantId: 'r4', name: 'Chicken biryani', category: 'Pakistani', description: 'Fragrant basmati, tender chicken, house masala', price: 950, deliveryFee: 180, rating: '4.9', image: 'photo-1563379091339-03246963d96c', tag: 'HOUSE FAVORITE' },
  { id: 'f5', restaurantId: 'r4', name: 'Mutton karahi', category: 'Pakistani', description: 'Wok-cooked mutton, tomatoes, ginger and green chili', price: 2450, deliveryFee: 180, rating: '4.8', image: 'photo-1544025162-d76694265947', tag: 'MADE TO ORDER' },
  { id: 'f6', restaurantId: 'r5', name: 'Grilled chicken steak', category: 'Continental', description: 'Pepper sauce, buttered vegetables, crisp fries', price: 1850, deliveryFee: 150, rating: '4.8', image: 'photo-1532550907401-a500c9a57435', tag: 'CHEF’S PICK' },
  { id: 'f7', restaurantId: 'r5', name: 'Creamy mushroom pasta', category: 'Continental', description: 'Silky cream sauce, mushrooms, parmesan', price: 1550, deliveryFee: 150, rating: '4.7', image: 'photo-1473093295043-cdd812d0e601', tag: '' },
  { id: 'f8', restaurantId: 'r1', name: 'Strawberry cloud cake', category: 'Desserts', description: 'Vanilla sponge, whipped mascarpone, fresh berries', price: 850, deliveryFee: 150, rating: '5.0', image: 'photo-1578985545062-69928b1d9587', tag: 'SWEET THING' },
];

export const formatPrice = (amount) => `PKR ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(Number(amount) || 0)}`;

export const imageUrl = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
