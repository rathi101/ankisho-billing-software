# 🧾 Ankisho Billing Software

A complete, modern billing and inventory management system with marketplace integration built with React and Node.js.

## 🚀 Features

### Core Features
- **Dashboard**: Real-time business analytics and metrics
- **Product Management**: Add, edit, manage products with categories
- **Customer Management**: Complete customer database
- **Supplier Management**: Vendor and supplier tracking
- **Sales Management**: Create invoices, track sales
- **Purchase Management**: Purchase orders and inventory
- **Inventory Tracking**: Real-time stock management
- **Reports & Analytics**: Comprehensive business reports
- **Marketplace Integration**: Sync sales from Meesho, Amazon, Flipkart
- **Multi-channel Analytics**: Combined marketplace and direct sales reporting

### Technical Features
- Modern React 18 with TypeScript
- Material-UI v5 for beautiful UI
- Node.js/Express backend
- MongoDB database
- Real-time updates
- Responsive design
- Dark/Light theme support

## 📦 Project Structure

```
billing-software/
├── backend/                 # Node.js/Express server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── server.js
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── public/
└── README.md
```

## 🛠 Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- CORS enabled

### Frontend
- React 18
- TypeScript
- Material-UI v5
- React Router v6
- Axios for API calls
- React Hook Form

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd billing-software
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   ```bash
   # In backend directory, copy .env.example to .env and update values
   cp .env.example .env
   
   # Update .env with your configuration:
   MONGODB_URI=mongodb://localhost:27017/billing-software
   JWT_SECRET=your_strong_jwt_secret_key_here
   PORT=5001
   FRONTEND_URL=http://localhost:3001
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

5. **Start the Application**
   ```bash
   # Terminal 1 - Start Backend
   cd backend
   npm start
   
   # Terminal 2 - Start Frontend
   cd frontend
   npm start
   ```

6. **Create Admin User**
   ```bash
   # In backend directory, create admin user
   node create-admin.js
   ```

7. **Access the Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5001/api

## 📱 Usage

1. **Dashboard**: View business metrics and recent activities
2. **Products**: Manage your product catalog
3. **Customers**: Add and manage customer information
4. **Sales**: Create invoices and track sales
5. **Purchases**: Manage purchase orders
6. **Inventory**: Monitor stock levels
7. **Reports**: Generate business reports
8. **Marketplace Integration**: Configure and sync marketplace sales

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Create new purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### Marketplace Integration
- `GET /api/marketplace/configs` - Get marketplace configurations
- `POST /api/marketplace/configs` - Create marketplace config
- `POST /api/marketplace/sync` - Sync marketplace orders
- `GET /api/marketplace/sales` - Get marketplace sales
- `GET /api/marketplace/analytics` - Get marketplace analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for modern businesses.
