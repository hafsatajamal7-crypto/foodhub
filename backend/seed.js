import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Category from './models/Category.js';
import Food from './models/Food.js';
import Order from './models/Order.js';

const demoPassword = 'Foodhub123!';
const pictures = [
  'photo-1512621776951-a57141f2eefd', 'photo-1473093295043-cdd812d0e601',
  'photo-1498837167922-ddd27525d352', 'photo-1578985545062-69928b1d9587',
  'photo-1547592180-85f173990554', 'photo-1555939594-58d7cb561ad1',
];
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

async function upsertUser(data) {
  let user = await User.findOne({ email: data.email });
  if (!user) user = new User({ ...data, password: demoPassword });
  else Object.assign(user, data);
  await user.save();
  return user;
}

async function seed() {
  await connectDB();
  const admin = await upsertUser({ name: 'FoodHub Admin', email: 'admin@foodhub.local', role: 'admin', phone: '555-0100' });
  const owners = await Promise.all([1, 2, 3].map((number) => upsertUser({ name: `Demo Owner ${number}`, email: `owner${number}@foodhub.local`, role: 'restaurant', phone: `555-020${number}` })));
  await Promise.all(Array.from({ length: 10 }, (_, index) => upsertUser({ name: `Demo Customer ${index + 1}`, email: `customer${index + 1}@foodhub.local`, role: 'customer', phone: `555-03${String(index + 1).padStart(2, '0')}` })));

  const restaurantData = [
    ['The Green Fork', 'Fresh bowls and seasonal plates', ['Modern healthy', 'Bowls'], 'photo-1512621776951-a57141f2eefd'],
    ['Pasta Social Club', 'Handmade pasta, always made with care', ['Italian', 'Continental'], 'photo-1473093295043-cdd812d0e601'],
    ['Little Seoul', 'Comforting Korean-inspired favorites', ['Korean', 'Asian'], 'photo-1498837167922-ddd27525d352'],
    ['Sunday Slice', 'A neighborhood pizza worth sharing', ['Pizza', 'Italian'], 'photo-1579751626657-72bc17010498'],
    ['Sweet & Simple', 'Small-batch bakes and good coffee', ['Desserts', 'Cafe'], 'photo-1578985545062-69928b1d9587'],
    ['Karachi Tandoor', 'Karachi-style biryani, karahi and BBQ', ['Pakistani', 'BBQ', 'Biryani'], 'photo-1544025162-d76694265947'],
    ['Continental Table', 'Steaks, pastas and classic comfort plates', ['Continental', 'Steak', 'Italian'], 'photo-1532550907401-a500c9a57435'],
  ];
  const restaurants = [];
  for (let index = 0; index < restaurantData.length; index += 1) {
    const [name, description, cuisine, photo] = restaurantData[index];
    const owner = owners[index % owners.length];
    let restaurant = await Restaurant.findOne({ name, owner: owner._id });
    if (!restaurant) restaurant = new Restaurant({ owner: owner._id, name, address: `${120 + index} Bedford Ave, Brooklyn, NY`, phone: '555-0400' });
    Object.assign(restaurant, { description, cuisine, address: `${120 + index} Clifton Block ${index + 1}, Karachi, Pakistan`, coverImage: image(photo), logo: image(photo), rating: [4.9, 4.8, 4.7, 4.8, 4.9, 4.9, 4.8][index], deliveryTime: '25-40 min', deliveryFee: [150, 100, 200, 150, 100, 180, 150][index], status: 'Approved' });
    await restaurant.save();
    restaurants.push(restaurant);
  }

  const categoryData = [
    ['Bowls', 0], ['Drinks', 0], ['Pasta', 1], ['Continental', 1],
    ['Asian', 2], ['Burgers', 2], ['Pizza', 3], ['Desserts', 4],
    ['Pakistani', 5], ['Biryani', 5], ['Continental', 6], ['Steak', 6],
  ];
  const categories = [];
  for (const [name, restaurantIndex] of categoryData) {
    const restaurant = restaurants[restaurantIndex];
    let category = await Category.findOne({ restaurant: restaurant._id, name });
    if (!category) category = new Category({ restaurant: restaurant._id, name });
    category.image = image(pictures[restaurantIndex % pictures.length]);
    await category.save();
    categories.push(category);
  }

  const dishNames = [
    ['Avocado crunch bowl', 'Crispy chicken grain bowl', 'Roasted squash plate', 'Green goddess salad', 'Sesame tofu bowl', 'Citrus quinoa bowl'],
    ['Pesto rigatoni', 'Sunday tomato tagliatelle', 'Brown butter gnocchi', 'Lemon ricotta ravioli', 'Mushroom cavatelli', 'Spicy vodka pasta'],
    ['Crispy tofu bao', 'Korean fried chicken', 'Kimchi fried rice', 'Bulgogi rice bowl', 'Sesame noodle salad', 'Gochujang cauliflower'],
    ['Classic margherita', 'Hot honey pepperoni', 'Mushroom white pie', 'Roasted garlic slice', 'Garden pesto pizza', 'Spicy sausage pie'],
    ['Strawberry cloud cake', 'Dark chocolate cookie', 'Lemon olive oil cake', 'Cinnamon morning bun', 'Salted caramel tart', 'Vanilla berry shortcake'],
    ['Chicken biryani', 'Mutton karahi', 'Chicken tikka boti', 'Beef seekh kebab', 'Chicken handi', 'Chapli kebab'],
    ['Grilled chicken steak', 'Creamy mushroom pasta', 'Chicken parmesan', 'Fish and chips', 'Beef lasagna', 'Pepper steak'],
  ];
  const descriptions = ['A neighborhood favorite, made fresh to order.', 'Seasonal ingredients, a little kitchen magic.', 'Bright flavors with something crunchy on top.', 'Comfort food made with care and good ingredients.', 'A delicious classic with a FoodHub twist.', 'Simple, generous, and ready to enjoy.'];
  const basePrices = [850, 1350, 950, 1100, 450, 950, 1100];
  const priceSteps = [0, 200, 350, 500, 150, 250];
  let foodCount = 0;
  for (let placeIndex = 0; placeIndex < restaurants.length; placeIndex += 1) {
    for (let dishIndex = 0; dishIndex < 6; dishIndex += 1) {
      const name = dishNames[placeIndex][dishIndex];
      const desiredCategory = placeIndex === 5 ? 'Pakistani' : placeIndex === 6 ? 'Continental' : null;
      const category = categories.find((item) => item.restaurant.equals(restaurants[placeIndex]._id) && (!desiredCategory || item.name === desiredCategory));
      let food = await Food.findOne({ restaurant: restaurants[placeIndex]._id, name });
      if (!food) food = new Food({ restaurant: restaurants[placeIndex]._id, category: category._id, name });
      Object.assign(food, {
        category: category._id,
        description: descriptions[dishIndex],
        price: basePrices[placeIndex] + priceSteps[dishIndex],
        image: image(pictures[(placeIndex + dishIndex) % pictures.length]),
        ingredients: ['Seasonal produce', 'House-made sauce'],
        rating: Number((4.6 + ((dishIndex + placeIndex) % 5) / 10).toFixed(1)),
        isAvailable: true,
      });
      await food.save();
      foodCount += 1;
    }
  }

  if (await Order.countDocuments() === 0) {
    const sampleFood = await Food.findOne({ restaurant: restaurants[0]._id });
    const subtotal = sampleFood.price;
    const deliveryFee = restaurants[0].deliveryFee;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    await Order.create({ customer: (await User.findOne({ email: 'customer1@foodhub.local' }))._id, restaurant: restaurants[0]._id, items: [{ food: sampleFood._id, name: sampleFood.name, quantity: 1, unitPrice: sampleFood.price }], subtotal, deliveryFee, tax, discount: 0, total: subtotal + deliveryFee + tax, deliveryAddress: '45 Demo Street, Brooklyn, NY', phone: '555-0301' });
  }

  console.log('FoodHub demo data ready.');
  console.log(`Admin: admin@foodhub.local / ${demoPassword}`);
  console.log(`Owners: owner1@foodhub.local through owner3@foodhub.local / ${demoPassword}`);
  console.log(`Customers: customer1@foodhub.local through customer10@foodhub.local / ${demoPassword}`);
  console.log(`Restaurants: ${restaurants.length}, categories: ${categories.length}, foods: ${foodCount}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
