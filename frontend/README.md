# QuickPick Frontend

A vanilla HTML, CSS, and JavaScript frontend for the QuickPick e-commerce application.

## Project Structure

```
frontend/
├── index.html           # Main HTML file
├── README.md            # This file
├── css/
│   └── styles.css       # All styling
├── js/
│   ├── main.js          # Application entry point
│   ├── api.js           # API communication
│   ├── auth.js          # Authentication logic
│   ├── products.js      # Product management
│   └── cart.js          # Shopping cart logic
└── assets/
    └── images/          # Image storage
```

## Features

### User Authentication
- User signup and login
- JWT token-based authentication
- Persistent session management
- Profile viewing and editing

### Product Browsing
- View all products in a responsive grid
- Product filtering by category
- Product search functionality
- Product details view

### Shopping Cart
- Add items to cart
- Remove items from cart
- Update item quantities
- Cart persistence in localStorage

### Checkout & Orders
- Create orders from cart
- Order confirmation
- Order history view

## Setup Instructions

### 1. Basic Setup (No Installation Required)
This is a vanilla JavaScript project - no build tools needed!

### 2. Configure API URL
Update `API_BASE_URL` in `js/api.js` if backend runs on different port:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### 3. Start a Local Server
You can use Python or Node.js to serve the files:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js (with http-server):**
```bash
npx http-server
```

**Using Live Server (VS Code Extension):**
Right-click `index.html` → Open with Live Server

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:8000
```

## How It Works

### Authentication Flow
1. User signs up with name, email, password
2. Backend hashes password and stores in database
3. User logs in with email and password
4. Backend validates credentials and returns JWT token
5. Token is stored in localStorage for subsequent requests

### Shopping Flow
1. User browses products from backend API
2. User adds products to local cart
3. Cart data stored in localStorage
4. User proceeds to checkout
5. Order created with cart items
6. Cart is cleared after successful order

### API Integration
- `api.js` handles all communication with backend
- Automatically includes JWT token in request headers
- Error handling and response validation built-in

## Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox and Grid
- **Vanilla JavaScript** - No frameworks
- **Fetch API** - HTTP requests
- **localStorage** - Client-side data persistence

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Notes
- All data is stored in MongoDB on the backend
- Cart is temporarily stored in browser's localStorage
- JWT token expires after 24 hours
- Production deployment should use HTTPS
