# QuickPick - Full-Stack E-Commerce Application

A complete full-stack e-commerce application built with Node.js, Express, MongoDB, and Vanilla JavaScript.

## 📁 Project Structure

```
QuickPick/
├── backend/                 # Node.js + Express Backend
│   ├── server.js           # Main server entry point
│   ├── package.json        # Dependencies
│   ├── .env                # Environment variables
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/        # Business logic
│   ├── routes/             # API endpoints
│   ├── models/             # MongoDB schemas
│   ├── middleware/         # Authentication
│   └── README.md          # Backend documentation
│
└── frontend/                # Vanilla HTML/CSS/JS Frontend
    ├── index.html          # Main page
    ├── css/
    │   └── styles.css      # All styling
    ├── js/                 # JavaScript logic
    │   ├── main.js        # Entry point
    │   ├── api.js         # API calls
    │   ├── auth.js        # Authentication
    │   ├── products.js    # Products logic
    │   └── cart.js        # Cart logic
    ├── assets/
    │   └── images/        # Image storage
    └── README.md          # Frontend documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- Code Editor (VS Code recommended)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file** (already created, verify settings):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickpick
JWT_SECRET=your_secret_key_here
```

4. **Start MongoDB:**
```bash
mongod
```

5. **Start the server:**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Start a local server:**
Using Python:
```bash
python -m http.server 8000
```

Or using Node.js:
```bash
npx http-server
```

3. **Open in browser:**
```
http://localhost:8000
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/profile` - Delete account
- `GET /api/users` - Get all users (Admin)

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (Admin)
- `DELETE /api/orders/:id` - Cancel order

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling (Flexbox, Grid)
- **Vanilla JavaScript** - No frameworks, pure JS
- **Fetch API** - API communication
- **localStorage** - Client-side storage

## 📊 Database Models

### User Schema
- name: String
- email: String (unique)
- password: String (hashed)
- phone: String
- address: String
- city: String
- zipCode: String
- isAdmin: Boolean

### Product Schema
- name: String
- description: String
- price: Number
- category: String
- stock: Number
- rating: Number
- reviews: Number
- image: String
- isAvailable: Boolean

### Cart Schema
- userId: ObjectId (ref: User)
- items: Array of {productId, quantity, price}
- totalPrice: Number

### Order Schema
- userId: ObjectId (ref: User)
- items: Array of {productId, quantity, price}
- totalAmount: Number
- status: String (pending, confirmed, shipped, delivered, cancelled)
- shippingAddress: String
- paymentMethod: String
- paymentStatus: String (pending, completed, failed)

## 🔐 Authentication Flow

1. User registers with email/password
2. Password is hashed using bcryptjs
3. User account created in MongoDB
4. User logs in with credentials
5. JWT token generated and sent to frontend
6. Frontend stores token in localStorage
7. Token included in subsequent API requests
8. Middleware validates token on protected routes

## 🎨 Features Implemented

### User Features
- ✅ User registration and login
- ✅ Profile management
- ✅ Browse products
- ✅ Search and filter products
- ✅ Add/remove items from cart
- ✅ Checkout and order placement
- ✅ View order history

### Admin Features
- ✅ Manage products (CRUD)
- ✅ Manage users
- ✅ Update order status
- ✅ View all orders

## 📝 Getting Started with Development

1. **Add Sample Data:**
```javascript
// Connect to MongoDB and add test products
const testProduct = new Product({
  name: "Laptop",
  description: "High-performance laptop",
  price: 999.99,
  category: "Electronics",
  stock: 10,
  rating: 4.5
});
await testProduct.save();
```

2. **Test API Endpoints:**
Use Postman or similar tool to test endpoints

3. **Modify Styling:**
Edit `frontend/css/styles.css` to customize appearance

4. **Add Features:**
Extend controllers and routes for additional functionality

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify database name in MONGODB_URI

### CORS Errors
- Backend and frontend must run on different ports
- CORS middleware already configured in `server.js`
- Update CORS_ORIGIN in `.env` if needed

### Port Already in Use
- Change PORT in `.env` (backend)
- Change port in http-server command (frontend)

### Missing Dependencies
- Run `npm install` in backend directory
- All frontend dependencies already included

## 📚 Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT Introduction](https://jwt.io)
- [MDN Web Docs](https://developer.mozilla.org)

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🤝 Contributing

This is a learning project. Feel free to fork, modify, and improve!

---

**Built with ❤️ as a full-stack e-commerce solution**
