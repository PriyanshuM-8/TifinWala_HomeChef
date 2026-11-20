# GharKaSwad – HomeChef Application

GharKaSwad is a homemade food marketplace that connects local HomeChefs with customers looking for fresh, hygienic, and home-style meals.

The HomeChef Application allows local cooks to register their profiles, list homemade food, manage customer orders, handle meal subscriptions, and track their earnings.

Our goal is to empower local HomeChefs, especially people who prepare homemade food, by helping them reach more customers and earn through their cooking skills.

## Features

### 1. HomeChef Registration & Authentication
- HomeChef registration.
- Secure login and authentication using JWT.
- Manage personal and kitchen information.
- Upload profile and kitchen images using Cloudinary.
- View account approval status.
- Access the dashboard after successful admin approval.

### 2. Admin Approval System
- New HomeChef registrations require Admin approval.
- HomeChefs can check their approval status.
- Only approved HomeChefs can access eligible food listing and order management features.
- Admin can review HomeChef information and manage account status.

### 3. Dashboard
- View total orders.
- View pending and completed orders.
- Track food performance.
- View earnings summary.
- Check commission wallet balance.
- Access important account information.

### 4. Food Management
- Add new homemade food items.
- Upload food images.
- Select food categories.
- Add food name, description, and price.
- Update food information.
- Manage food availability.
- View listed food items.
- Manage food according to platform rules.

### 5. Order Management
- Receive customer orders.
- Get order notifications where real-time notification support is configured.
- View complete order details.
- Accept or reject eligible orders.
- Manage order preparation and delivery status.
- View order history.
- Check payment method and order amount.

### 6. Meal Subscription Management
- Receive subscription meal assignments.
- View scheduled Breakfast, Lunch, and Dinner orders.
- Manage assigned subscription meals.
- Check individual meal details and customer information.
- Track upcoming and completed subscription meals.
- Handle eligible meal cancellations and changes according to platform rules.

### 7. Chef Earnings Wallet
- View total earnings.
- Track completed order earnings.
- View pending earnings.
- Check earnings transaction history.
- Track online order earnings.
- View eligible reward meal earnings separately.
- Monitor payout-related information where supported.

### 8. Chef Commission Wallet
The Commission Wallet is separate from the Chef Earnings Wallet.

- View available commission wallet balance.
- Check reserved and used amounts.
- View commission transaction history.
- Monitor COD eligibility.
- View required recharge amount when the available balance is insufficient.
- Track commission and COD fee deductions.

**Commission Rules:**
- The first accepted order receives a 0% commission benefit.
- Subsequent eligible orders are subject to 10% commission.
- A minimum available balance of ₹50 must remain for eligible COD orders after reserving estimated commission and COD handling fee.
- The COD handling fee is ₹20.
- Online orders do not require the ₹50 COD wallet minimum.

### 9. Customer Reviews
- View customer reviews and ratings.
- Monitor feedback on food and service.
- Improve food quality based on customer feedback.

### 10. Profile Management
- Update personal information.
- Manage kitchen details.
- Update profile and kitchen images.
- View account approval status.
- Manage available profile information.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive UI styling |
| React Router DOM | Application routing |
| Axios | Backend API communication |
| Lucide React | Icons |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| JWT | Authentication |
| Cloudinary | Image storage |
| Socket.IO | Real-time communication, where supported by the backend |

## Project Structure

```text
HomeChef/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── pages/
│   │   ├── Authentication/
│   │   ├── Dashboard/
│   │   ├── FoodManagement/
│   │   ├── Orders/
│   │   ├── Subscriptions/
│   │   ├── Earnings/
│   │   ├── CommissionWallet/
│   │   ├── Reviews/
│   │   └── Profile/
│   │
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .gitignore
├── index.html
├── package.json
└── README.md
```

*Note: The folder structure may vary according to the actual implementation.*

## Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_HOMECHEF_REPOSITORY_URL
```

### 2. Navigate to HomeChef Folder

```bash
cd HomeChef
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Replace the API URL with your deployed backend URL when deploying the application.

**Security:** Never expose private API secrets, JWT secrets, database credentials, or payment gateway secret keys in frontend environment variables.

### 5. Start Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 6. Create Production Build

```bash
npm run build
```

### 7. Preview Production Build

```bash
npm run preview
```

## UI Theme & Design

The HomeChef Application follows the same visual identity as the GharKaSwad Customer Application.

| Color | Hex Code |
|---|---|
| Primary Green | `#14513F` |
| Primary Orange | `#F6A23A` |
| Cream White | `#FFFDF8` |
| Dark Text | `#27352F` |
| Secondary Text | `#737B76` |
| Light Background | `#F7F8F5` |
| Border | `#E8ECE7` |

### Design Principles
- Premium and professional dashboard.
- Mobile-first responsive design.
- Easy-to-use food and order management.
- Consistent typography and spacing.
- Mobile-friendly navigation.
- Responsive cards, forms, and tables.
- Consistent branding across all GharKaSwad applications.

## Responsive Support

The HomeChef Application is designed to work across:

- Mobile phones
- Tablets
- Laptops
- Desktop screens

## Important Business Rules

- HomeChef accounts require Admin approval.
- Only eligible and approved HomeChefs can manage food and orders.
- Commission calculations are handled by the backend.
- Chef Earnings Wallet and Chef Commission Wallet are separate.
- COD orders follow the platform's commission wallet eligibility rules.
- Online order earnings are credited according to successful payment and delivery rules.
- Reward coupon meals follow separate earning and commission rules.
- All financial transactions must be verified and recorded by the backend.

## Future Enhancements

Potential future improvements include:
- Push notifications.
- Advanced order analytics.
- Improved earnings reports.
- Mobile application packaging.
- Enhanced kitchen performance insights.

## Project

**GharKaSwad – Homemade Food, Made with Love.**

Empowering local HomeChefs and bringing the taste of homemade food to everyone.