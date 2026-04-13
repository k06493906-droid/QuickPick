# QuickPick Backend

A complete Node.js and Express-based backend for the QuickPick e-commerce application.

## Project Structure

```
backend/
├── server.js                 # Main Express server
├── package.json              # Dependencies
├── .env                      # Environment variables
├── config/
│   └── db.js                 # MongoDB connection setup
├── controllers/              # Business logic
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── productController.js # Product management
│   ├── cartController.js    # Shopping cart logic
│   └── orderController.js   # Order management
├── routes/                   # API endpoints
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User endpoints
│   ├── productRoutes.js     # Product endpoints
│   ├── cartRoutes.js        # Cart endpoints
│   └── orderRoutes.js       # Order endpoints
├── models/                   # MongoDB schemas
│   ├── User.js              # User schema
│   ├── Product.js           # Product schema
│   ├── Cart.js              # Cart schema
│   └── Order.js             # Order schema
└── middleware/
    └── authMiddleware.js     # JWT authentication
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file with the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickpick
JWT_SECRET=your_secret_key
```

### 3. Start MongoDB
Ensure MongoDB is running on your machine:
```bash
mongod
```

### 4. Run the Server
**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account
- `GET /api/users` - Get all users (Admin)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (Admin)
- `DELETE /api/orders/:id` - Cancel order

## Technologies Used
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
