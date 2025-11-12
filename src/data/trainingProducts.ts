import { Product } from '@/types/onboarding'

/**
 * 50 Diverse Training Products
 * Covering wide range of categories, prices, and product types
 */
export const TRAINING_PRODUCTS: Product[] = [
  // Electronics (10)
  { id: 'prod-1', title: 'Wireless Bluetooth Headphones - Premium Sound', price: '$79.99', priceNumeric: 79.99, image: '🎧', category: 'Electronics', rating: 4.5, features: ['wireless', 'bluetooth'] },
  { id: 'prod-2', title: 'Portable Phone Charger - 20000mAh', price: '$29.99', priceNumeric: 29.99, image: '🔋', category: 'Electronics', rating: 4.7, features: ['portable', 'fast-charging'] },
  { id: 'prod-3', title: 'Gaming Mouse - RGB Backlit', price: '$44.99', priceNumeric: 44.99, image: '🖱️', category: 'Electronics', rating: 4.6, features: ['RGB', 'ergonomic'] },
  { id: 'prod-4', title: 'Smart Watch - Fitness Tracker', price: '$199.99', priceNumeric: 199.99, image: '⌚', category: 'Electronics', rating: 4.3, features: ['smart', 'fitness'] },
  { id: 'prod-5', title: 'Wireless Keyboard - Mechanical', price: '$89.99', priceNumeric: 89.99, image: '⌨️', category: 'Electronics', rating: 4.8, features: ['mechanical', 'wireless'] },
  { id: 'prod-6', title: 'USB-C Hub - 7-in-1 Adapter', price: '$34.99', priceNumeric: 34.99, image: '🔌', category: 'Electronics', rating: 4.4, features: ['USB-C', 'multi-port'] },
  { id: 'prod-7', title: 'Webcam - 1080p HD', price: '$59.99', priceNumeric: 59.99, image: '📷', category: 'Electronics', rating: 4.5, features: ['HD', 'webcam'] },
  { id: 'prod-8', title: 'Bluetooth Speaker - Waterproof', price: '$49.99', priceNumeric: 49.99, image: '🔊', category: 'Electronics', rating: 4.6, features: ['bluetooth', 'waterproof'] },
  { id: 'prod-9', title: 'Ring Light - LED for Video', price: '$39.99', priceNumeric: 39.99, image: '💡', category: 'Electronics', rating: 4.7, features: ['LED', 'adjustable'] },
  { id: 'prod-10', title: 'Laptop Stand - Aluminum', price: '$29.99', priceNumeric: 29.99, image: '💻', category: 'Electronics', rating: 4.5, features: ['aluminum', 'ergonomic'] },
  
  // Clothing (8)
  { id: 'prod-11', title: 'Organic Cotton T-Shirt - Eco-Friendly', price: '$24.99', priceNumeric: 24.99, image: '👕', category: 'Clothing', rating: 4.8, features: ['organic', 'eco-friendly'] },
  { id: 'prod-12', title: 'Running Shoes - Lightweight', price: '$89.99', priceNumeric: 89.99, image: '👟', category: 'Clothing', rating: 4.6, features: ['lightweight', 'comfortable'] },
  { id: 'prod-13', title: 'Winter Jacket - Waterproof', price: '$149.99', priceNumeric: 149.99, image: '🧥', category: 'Clothing', rating: 4.7, features: ['waterproof', 'warm'] },
  { id: 'prod-14', title: 'Baseball Cap - Adjustable', price: '$19.99', priceNumeric: 19.99, image: '🧢', category: 'Clothing', rating: 4.4, features: ['adjustable', 'casual'] },
  { id: 'prod-15', title: 'Sunglasses - UV Protection', price: '$34.99', priceNumeric: 34.99, image: '🕶️', category: 'Clothing', rating: 4.5, features: ['UV-protection', 'polarized'] },
  { id: 'prod-16', title: 'Backpack - 30L Travel', price: '$59.99', priceNumeric: 59.99, image: '🎒', category: 'Clothing', rating: 4.8, features: ['spacious', 'durable'] },
  { id: 'prod-17', title: 'Leather Belt - Genuine', price: '$29.99', priceNumeric: 29.99, image: '👔', category: 'Clothing', rating: 4.6, features: ['leather', 'classic'] },
  { id: 'prod-18', title: 'Sports Socks - 6 Pack', price: '$14.99', priceNumeric: 14.99, image: '🧦', category: 'Clothing', rating: 4.3, features: ['athletic', 'cushioned'] },
  
  // Home & Kitchen (10)
  { id: 'prod-19', title: 'Stainless Steel Water Bottle - 32oz', price: '$19.99', priceNumeric: 19.99, image: '🍾', category: 'Home', rating: 4.6, features: ['reusable', 'eco-friendly'] },
  { id: 'prod-20', title: 'Coffee Maker - Programmable 12-Cup', price: '$49.99', priceNumeric: 49.99, image: '☕', category: 'Kitchen', rating: 4.3, features: ['programmable', 'automatic'] },
  { id: 'prod-21', title: 'Air Fryer - 5.8 Quart', price: '$79.99', priceNumeric: 79.99, image: '🍟', category: 'Kitchen', rating: 4.7, features: ['healthy', 'non-stick'] },
  { id: 'prod-22', title: 'Knife Set - 15 Pieces', price: '$69.99', priceNumeric: 69.99, image: '🔪', category: 'Kitchen', rating: 4.5, features: ['sharp', 'stainless-steel'] },
  { id: 'prod-23', title: 'Blender - 1200W Professional', price: '$89.99', priceNumeric: 89.99, image: '🥤', category: 'Kitchen', rating: 4.8, features: ['powerful', 'versatile'] },
  { id: 'prod-24', title: 'Cutting Board - Bamboo', price: '$24.99', priceNumeric: 24.99, image: '🪵', category: 'Kitchen', rating: 4.6, features: ['bamboo', 'eco-friendly'] },
  { id: 'prod-25', title: 'Cast Iron Skillet - 12 inch', price: '$39.99', priceNumeric: 39.99, image: '🍳', category: 'Kitchen', rating: 4.9, features: ['cast-iron', 'durable'] },
  { id: 'prod-26', title: 'Throw Pillows - Set of 2', price: '$29.99', priceNumeric: 29.99, image: '🛋️', category: 'Home', rating: 4.4, features: ['decorative', 'soft'] },
  { id: 'prod-27', title: 'LED Desk Lamp - USB Charging', price: '$34.99', priceNumeric: 34.99, image: '💡', category: 'Home', rating: 4.5, features: ['LED', 'adjustable'] },
  { id: 'prod-28', title: 'Indoor Plant - Snake Plant', price: '$19.99', priceNumeric: 19.99, image: '🪴', category: 'Home', rating: 4.7, features: ['low-maintenance', 'air-purifying'] },
  
  // Fitness & Sports (8)
  { id: 'prod-29', title: 'Yoga Mat - Non-Slip Exercise', price: '$39.99', priceNumeric: 39.99, image: '🧘', category: 'Fitness', rating: 4.9, features: ['non-slip', 'eco-friendly'] },
  { id: 'prod-30', title: 'Dumbbells - Adjustable 50lbs', price: '$149.99', priceNumeric: 149.99, image: '🏋️', category: 'Fitness', rating: 4.6, features: ['adjustable', 'compact'] },
  { id: 'prod-31', title: 'Resistance Bands - Set of 5', price: '$24.99', priceNumeric: 24.99, image: '🎯', category: 'Fitness', rating: 4.7, features: ['versatile', 'portable'] },
  { id: 'prod-32', title: 'Jump Rope - Speed Rope', price: '$12.99', priceNumeric: 12.99, image: '🪢', category: 'Fitness', rating: 4.5, features: ['speed', 'adjustable'] },
  { id: 'prod-33', title: 'Gym Bag - Duffle 40L', price: '$44.99', priceNumeric: 44.99, image: '💼', category: 'Fitness', rating: 4.4, features: ['spacious', 'durable'] },
  { id: 'prod-34', title: 'Protein Shaker Bottle - 28oz', price: '$14.99', priceNumeric: 14.99, image: '🧃', category: 'Fitness', rating: 4.6, features: ['leak-proof', 'BPA-free'] },
  { id: 'prod-35', title: 'Foam Roller - High Density', price: '$29.99', priceNumeric: 29.99, image: '🎲', category: 'Fitness', rating: 4.8, features: ['massage', 'recovery'] },
  { id: 'prod-36', title: 'Bicycle Helmet - Safety Certified', price: '$49.99', priceNumeric: 49.99, image: '🪖', category: 'Sports', rating: 4.7, features: ['safety', 'ventilated'] },
  
  // Books & Education (5)
  { id: 'prod-37', title: 'Self-Help Book - Bestseller', price: '$16.99', priceNumeric: 16.99, image: '📚', category: 'Books', rating: 4.8, features: ['inspiring', 'practical'] },
  { id: 'prod-38', title: 'Cookbook - Healthy Recipes', price: '$24.99', priceNumeric: 24.99, image: '📖', category: 'Books', rating: 4.6, features: ['healthy', '100-recipes'] },
  { id: 'prod-39', title: 'Journal - Leather Bound', price: '$19.99', priceNumeric: 19.99, image: '📓', category: 'Books', rating: 4.7, features: ['leather', 'lined-pages'] },
  { id: 'prod-40', title: 'Coloring Book - Adult Relaxation', price: '$12.99', priceNumeric: 12.99, image: '🎨', category: 'Books', rating: 4.5, features: ['relaxing', 'detailed'] },
  { id: 'prod-41', title: 'Planner - 2024 Daily', price: '$22.99', priceNumeric: 22.99, image: '📅', category: 'Books', rating: 4.4, features: ['organized', 'goal-setting'] },
  
  // Beauty & Personal Care (5)
  { id: 'prod-42', title: 'Skincare Set - 5 Piece Organic', price: '$59.99', priceNumeric: 59.99, image: '🧴', category: 'Beauty', rating: 4.8, features: ['organic', 'natural'] },
  { id: 'prod-43', title: 'Electric Toothbrush - Rechargeable', price: '$39.99', priceNumeric: 39.99, image: '🪥', category: 'Personal Care', rating: 4.7, features: ['rechargeable', 'whitening'] },
  { id: 'prod-44', title: 'Hair Dryer - Ionic Technology', price: '$79.99', priceNumeric: 79.99, image: '💇', category: 'Beauty', rating: 4.6, features: ['ionic', 'fast-drying'] },
  { id: 'prod-45', title: 'Essential Oils Set - 10 Oils', price: '$29.99', priceNumeric: 29.99, image: '🧪', category: 'Beauty', rating: 4.5, features: ['aromatherapy', 'pure'] },
  { id: 'prod-46', title: 'Makeup Brush Set - Professional', price: '$34.99', priceNumeric: 34.99, image: '💄', category: 'Beauty', rating: 4.9, features: ['professional', 'soft-bristles'] },
  
  // Toys & Games (4)
  { id: 'prod-47', title: 'Board Game - Strategy Game', price: '$44.99', priceNumeric: 44.99, image: '🎲', category: 'Games', rating: 4.7, features: ['strategy', 'family-friendly'] },
  { id: 'prod-48', title: 'Puzzle - 1000 Pieces', price: '$19.99', priceNumeric: 19.99, image: '🧩', category: 'Games', rating: 4.6, features: ['challenging', 'scenic'] },
  { id: 'prod-49', title: 'Playing Cards - Premium Deck', price: '$12.99', priceNumeric: 12.99, image: '🃏', category: 'Games', rating: 4.5, features: ['durable', 'classic'] },
  { id: 'prod-50', title: 'Chess Set - Wooden Handcrafted', price: '$69.99', priceNumeric: 69.99, image: '♟️', category: 'Games', rating: 4.8, features: ['wooden', 'handcrafted'] },
]

