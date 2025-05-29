# Food Delivery Platform with Shared Backend

This project consists of two interconnected websites:
- `website` - Consumer-facing food delivery platform (current repository)
- `website1` - Restaurant dashboard (already deployed separately)

Both websites are connected to a MongoDB database, allowing restaurants to upload menu details and manage orders, while customers can browse menus and place orders.

## Project Structure

```
food-delivery-website/
├── website/               # Consumer-facing website
│   ├── index.html
│   ├── scripts.js
│   ├── styles.css
│   └── backend/           # API for the consumer-facing website
│       ├── package.json
│       ├── server.js
│       └── src/           # Server source code
│           ├── config/    # Database configuration
│           ├── controllers/
│           ├── middleware/
│           ├── models/    # Shared data models
│           └── routes/    # API routes
│
└── website1/              # Restaurant dashboard
    ├── index.html
    ├── scripts.js
    ├── styles.css
    └── backend/           # API for the restaurant dashboard
        ├── package.json
        ├── server.js
        └── src/           # Server source code
            ├── config/    # Database configuration
            ├── controllers/
            ├── middleware/
            ├── models/    # Shared data models
            └── routes/    # API routes
```

## Shared Data

The following data is shared between the consumer website and restaurant dashboard:

- **Restaurant Information**: Details about restaurants are accessible to both systems.
- **Menu Items**: Menu items created in the restaurant dashboard (website1) are displayed on the consumer website.
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

The restaurant dashboard backend has already been deployed separately. It is available at:

- Dashboard URL: `https://restaurant-dashboard.fooddelivery.com`
- API URL: `https://api.restaurant-dashboard.fooddelivery.com/api`

If you need to run the restaurant dashboard locally for development purposes, please contact the administrator for access to the repository and setup instructions.

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

### Restaurant Dashboard (website1) API Endpoints

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