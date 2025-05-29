const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a menu item name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['appetizer', 'main', 'dessert', 'beverage', 'sides', 'popular', 'special', 'other']
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  calories: {
    type: Number,
    default: 0
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  featured: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Boolean,
    default: true
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index on restaurant and name to ensure unique menu items per restaurant
MenuItemSchema.index({ restaurant: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);