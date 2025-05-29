# Food Delivery Platform

This project is a consumer-facing food delivery platform that connects with a separately deployed restaurant dashboard system. The consumer website allows customers to browse restaurant menus and place orders online, while restaurant owners can manage their menus and track orders through the dashboard.

The system uses a MongoDB database to store and share data between the consumer website and the restaurant dashboard.

## Deployment

The frontend of this application is deployed on GitHub Pages and can be accessed at:
[https://subhash6102003.github.io/Food-Delivery-Website-with-Shared-Backend/](https://subhash6102003.github.io/Food-Delivery-Website-with-Shared-Backend/)

Note that while the frontend is static and viewable on GitHub Pages, the backend functionality requires connecting to a running backend server.

## Project Structure

```
food-delivery-website/
├── start-mongodb.bat      # Script to start MongoDB locally
├── website/               # Consumer-facing website
│   ├── index.html         # Main HTML file
│   ├── scripts.js         # Frontend JavaScript
│   ├── styles.css         # CSS styles
│   ├── package.json       # Frontend dependencies
│   └── backend/           # API for the website
│       ├── package.json   # Backend dependencies
│       ├── server.js      # Entry point for the server
│       └── src/           # Server source code
│           ├── config/    # Database configuration
│           │   └── db.js  # MongoDB connection setup
│           ├── controllers/
│           │   ├── authController.js
│           │   ├── menuController.js
│           │   ├── orderController.js
│           │   └── restaurantController.js
│           ├── middleware/
│           │   └── auth.js
│           ├── models/    # Data models
│           │   ├── MenuItem.js
│           │   ├── Order.js
│           │   ├── Restaurant.js
│           │   └── User.js
│           ├── routes/    # API routes
│           │   ├── authRoutes.js
│           │   ├── menuRoutes.js
│           │   ├── orderRoutes.js
│           │   └── restaurantRoutes.js
│           └── services/
│               └── dataService.js
```

## Shared Data

The following data is shared between the consumer website and restaurant dashboard:

- **Restaurant Information**: Details about restaurants are accessible to both systems.
- **Menu Items**: Menu items created in the restaurant dashboard are displayed on the consumer website.
- **Orders**: Orders placed on the consumer website are visible to restaurant owners in their dashboard.

## Setup Instructions

### Prerequisites

- Node.js v16 or later
- MongoDB

### Setting up the Consumer Website Backend

1. Navigate to the consumer website backend directory:
```
cd website/backend
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following content:
```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/foodrunner
JWT_SECRET=yoursharedsecretkey123456789
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

4. Start the server:
```
npm run dev
```

The consumer website API will be available at `http://localhost:5001/api`.

### Restaurant Dashboard Backend

The restaurant dashboard backend has been successfully deployed to production. It is available at:

- Dashboard URL: `https://restaurant-dashboard.fooddelivery.com`
- API URL: `https://api.restaurant-dashboard.fooddelivery.com/api`

The restaurant dashboard provides restaurant owners with the ability to manage their menu items and track orders in real-time. If you need to run the restaurant dashboard locally for development purposes, please contact the administrator for access to the repository and setup instructions.

## API Documentation

### Consumer Website (website) API Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login a user
  - `GET /api/auth/me` - Get current user profile

- **Restaurants**
  - `GET /api/restaurants` - Get all restaurants
  - `GET /api/restaurants/:id` - Get a single restaurant
  - `GET /api/restaurants/top-rated` - Get top rated restaurants

- **Menu**
  - `GET /api/menu` - Get all menu items
  - `GET /api/menu/:id` - Get a single menu item
  - `GET /api/menu/restaurant/:restaurantId` - Get menu items for a restaurant

- **Orders**
  - `POST /api/orders` - Create a new order
  - `GET /api/orders` - Get all orders for logged in user
  - `GET /api/orders/:id` - Get a single order
  - `PUT /api/orders/:id/cancel` - Cancel an order

### Restaurant Dashboard API Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register a restaurant owner
  - `POST /api/auth/login` - Login a restaurant owner
  - `GET /api/auth/me` - Get current restaurant owner profile

- **Restaurants**
  - `POST /api/restaurants` - Create a new restaurant
  - `PUT /api/restaurants/:id` - Update restaurant details
  - `GET /api/restaurants/:id` - Get restaurant details

- **Menu**
  - `POST /api/menu` - Create a new menu item
  - `PUT /api/menu/:id` - Update a menu item
  - `DELETE /api/menu/:id` - Delete a menu item
  - `GET /api/menu/restaurant/:restaurantId` - Get menu items for a restaurant

- **Orders**
  - `GET /api/restaurants/:id/orders` - Get all orders for a restaurant
  - `PUT /api/orders/:id/status` - Update order status