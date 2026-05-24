# Edemy - Learning Management System

A full-stack LMS platform built with React, Node.js, MongoDB, Clerk authentication, and Stripe payments.

## Features

- 🎓 **Student Portal** - Browse courses, enroll, track progress, cart & checkout
- 👨‍🏫 **Educator Dashboard** - Create courses, manage content, view enrollments & earnings
- 👑 **Admin Panel** - Manage users, courses, and view platform analytics
- 🔐 **Authentication** - Secure login with Clerk (email/password & Google OAuth)
- 💳 **Payments** - Stripe integration for course purchases
- 📊 **Real-time Stats** - Dashboard analytics for educators and admins
- 🎥 **Video Player** - YouTube integration for course lectures
- 📝 **Rich Text Editor** - Quill editor for course descriptions

## Tech Stack

**Frontend:**
- React 18
- React Router v7
- Tailwind CSS
- Clerk React
- Axios
- React Toastify

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Clerk Express
- Stripe
- Cloudinary (image uploads)
- Multer (file handling)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Clerk account (for authentication)
- Stripe account (for payments)
- Cloudinary account (for image uploads)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Edemy-main
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Server (.env)

Create `server/.env` file:

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server Config
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CURRENCY=usd

# Seed Config (optional)
FORCE_SEED=false
SEED_ADMIN_EMAIL=admin@edemy.dev
SEED_ADMIN_PASSWORD=Admin@1234!
```

#### Client (.env)

Create `client/.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:5000
VITE_CURRENCY=$
```

### 4. Run the application

```bash
# Terminal 1 - Start server
cd server
npm run server

# Terminal 2 - Start client
cd client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

## Demo Credentials

### Admin Account
- **Email:** `admin@edemy.dev`
- **Password:** `Admin@1234!`
- **Access:** Full platform management, user management, all courses

### Teacher Accounts
- **Email:** `sarah@edemy.dev` | **Password:** `Teacher@1234!`
- **Email:** `james@edemy.dev` | **Password:** `Teacher@1234!`
- **Email:** `priya@edemy.dev` | **Password:** `Teacher@1234!`
- **Access:** Create/edit/delete own courses, view enrollments & earnings

### Student Accounts
- **Email:** `alex@edemy.dev` | **Password:** `Student@1234!`
- **Email:** `maria@edemy.dev` | **Password:** `Student@1234!`
- **Email:** `chris@edemy.dev` | **Password:** `Student@1234!`
- **Email:** `emma@edemy.dev` | **Password:** `Student@1234!`
- **Email:** `luca@edemy.dev` | **Password:** `Student@1234!`
- **Email:** `yuki@edemy.dev` | **Password:** `Student@1234!`
- **Access:** Browse courses, enroll, track progress, cart & checkout

## User Roles & Permissions

### Student (Default)
- Browse and search courses
- View course details and curriculum
- Add courses to cart
- Purchase courses via Stripe
- Access enrolled courses
- Track learning progress
- Rate and review courses

### Teacher/Educator
- All student permissions
- Create new courses
- Edit own courses (title, price, content, chapters)
- Delete own courses
- Upload course thumbnails
- Rich-text course descriptions
- View enrolled students
- Track earnings from course sales
- Real-time dashboard statistics

### Admin
- All platform access
- View platform statistics (users, courses, revenue)
- Manage all users (view, change roles, delete)
- Manage all courses (view, add, edit, delete any course)
- View all payment transactions
- Full course management across all educators

## Auto-Redirect on Login

After successful login, users are automatically redirected based on their role:
- **Admin** → `/admin` (Admin Dashboard)
- **Teacher** → `/educator` (Educator Dashboard)
- **Student** → `/` (Home Page)

## Database Seeding

The application automatically seeds demo data on first run when the database is empty. To force re-seed:

1. Set `FORCE_SEED=true` in `server/.env`
2. Restart the server
3. Set it back to `false` after seeding

## API Endpoints

### Public Routes
- `GET /api/course/all` - Get all courses
- `GET /api/course/:id` - Get course details

### Student Routes (Auth Required)
- `GET /api/user/data` - Get user profile
- `GET /api/user/enrolled-courses` - Get enrolled courses
- `GET /api/cart/get` - Get cart items
- `POST /api/cart/add` - Add to cart
- `POST /api/cart/remove` - Remove from cart

### Educator Routes (Auth Required)
- `GET /api/educator/dashboard` - Get dashboard stats
- `GET /api/educator/courses` - Get own courses
- `POST /api/educator/add-course` - Create course
- `POST /api/educator/edit-course` - Update course
- `POST /api/educator/delete-course` - Delete course

### Admin Routes (Auth Required)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/courses` - All courses
- `GET /api/admin/payments` - All payments
- `POST /api/admin/users/update-role` - Change user role
- `POST /api/admin/users/delete` - Delete user
- `POST /api/admin/courses/delete` - Delete any course

## Troubleshooting

### Clerk Rate Limit Error
If you see "Too many requests" error:
- The app now uses MongoDB-based login to bypass Clerk rate limits
- Demo accounts use MongoDB authentication
- New signups still use Clerk for account creation

### MongoDB Connection Issues
- Verify your MongoDB connection string
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

### Stripe Webhook Issues
- Use Stripe CLI for local webhook testing
- Verify webhook secret matches in `.env`
- Check webhook endpoint is accessible

## Deployment

The application is **deployment ready**! See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Summary
- **Backend:** Deploy to Railway (Node.js)
- **Frontend:** Deploy to Vercel (Vite/React)
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary
- **Auth:** Clerk
- **Payments:** Stripe

All necessary configuration files are included:
- `server/railway.toml` - Railway configuration
- `client/vercel.json` - Vercel configuration
- `.env.example` files - Environment variable templates

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository.
