# Sweet Shop Management System

A full-stack web application for managing a sweet shop, built with Test-Driven Development (TDD) principles using React, TypeScript, Supabase, and modern web technologies.

## Features

### User Features
- User registration and authentication with JWT tokens
- Browse available sweets with rich product information
- Advanced search and filtering by name, category, and price range
- Purchase sweets with real-time inventory updates
- Responsive design for mobile, tablet, and desktop

### Admin Features
- Add, update, and delete sweets
- Restock inventory
- View all products with stock levels
- Admin-only access control

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Backend
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Built-in authentication
  - Row Level Security (RLS)
  - Edge Functions for serverless API
- **Supabase Edge Functions** - Serverless API endpoints

### Database
- **PostgreSQL** (via Supabase)
- Tables: `sweets`, `user_profiles`, `purchases`
- Row Level Security policies for data protection

## Project Structure

```
sweet-shop/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx       # Admin CRUD interface
│   │   ├── AuthForm.tsx         # Login/Register forms
│   │   ├── Dashboard.tsx        # Main shop interface
│   │   ├── SearchBar.tsx        # Search and filter UI
│   │   └── SweetCard.tsx        # Product card with purchase
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication state management
│   ├── lib/
│   │   └── supabase.ts          # Supabase client setup
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
├── supabase/
│   ├── functions/
│   │   ├── sweets/              # CRUD operations Edge Function
│   │   └── inventory/           # Purchase/restock Edge Function
│   └── migrations/
│       └── create_sweet_shop_schema.sql
└── package.json
```

## API Endpoints

### Authentication
- `POST /auth/v1/signup` - Register new user
- `POST /auth/v1/token?grant_type=password` - Login user

### Sweets (Protected)
- `GET /functions/v1/sweets` - Get all sweets
- `GET /functions/v1/sweets/search?name=...&category=...&minPrice=...&maxPrice=...` - Search sweets
- `POST /functions/v1/sweets` - Add new sweet (Admin only)
- `PUT /functions/v1/sweets/:id` - Update sweet (Admin only)
- `DELETE /functions/v1/sweets/:id` - Delete sweet (Admin only)

### Inventory (Protected)
- `POST /functions/v1/inventory/purchase` - Purchase a sweet
- `POST /functions/v1/inventory/restock` - Restock a sweet (Admin only)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd sweet-shop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
The `.env` file is already configured with Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup
The database schema is automatically applied via Supabase migrations. The migration includes:
- Tables for sweets, user profiles, and purchases
- Row Level Security policies
- Sample data for testing

### 5. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 6. Create an Admin User
To create an admin user:
1. Register a new account through the UI
2. Connect to your Supabase database
3. Run this SQL query:
```sql
UPDATE user_profiles
SET is_admin = true
WHERE id = '<user-id-from-auth-users>';
```

## Testing the Application

### User Flow
1. Register a new account
2. Browse the sweet shop
3. Use search and filters to find products
4. Purchase sweets (quantity will decrease)
5. Try to purchase when stock is zero (should be disabled)

### Admin Flow
1. Login with admin account
2. Click "Admin Panel" button
3. Add new sweets
4. Edit existing sweets
5. Restock inventory
6. Delete products

## Security Features

- JWT-based authentication
- Row Level Security (RLS) on all tables
- Admin-only endpoints for sensitive operations
- Protected Edge Functions requiring valid tokens
- Input validation on both client and server
- CORS headers properly configured

## Database Schema

### `sweets` Table
```sql
id          UUID PRIMARY KEY
name        TEXT NOT NULL
category    TEXT NOT NULL
price       NUMERIC(10,2) NOT NULL CHECK (price >= 0)
quantity    INTEGER NOT NULL CHECK (quantity >= 0)
description TEXT
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

### `user_profiles` Table
```sql
id         UUID PRIMARY KEY REFERENCES auth.users(id)
is_admin   BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT NOW()
```

### `purchases` Table
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES auth.users(id)
sweet_id    UUID REFERENCES sweets(id)
quantity    INTEGER CHECK (quantity > 0)
total_price NUMERIC(10,2) CHECK (total_price >= 0)
created_at  TIMESTAMPTZ DEFAULT NOW()
```

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Type Checking

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

---

## My AI Usage

### AI Tools Used
I worked with **Claude (Anthropic's AI Assistant)** - specifically Claude Sonnet 4.5 - throughout the entire development of this project. Claude served as my primary development partner for this TDD kata.

### How I Used AI

#### 1. Project Architecture & Planning
- **What AI Did**: Claude helped me plan the overall architecture, suggesting the use of Supabase for the backend, organizing the component structure, and creating a comprehensive todo list to track development progress.
- **My Contribution**: I evaluated the architecture suggestions, understood the rationale for using Supabase Edge Functions vs. traditional API routes, and made decisions about component organization.

#### 2. Database Schema Design
- **What AI Did**: Generated the complete database migration with proper PostgreSQL syntax, including Row Level Security policies, indexes, and sample data. The migration file includes comprehensive documentation explaining each table and security policy.
- **My Contribution**: Reviewed the schema to ensure it met all requirements (user profiles, sweets inventory, purchase history), verified RLS policies were restrictive enough, and understood the security implications.

#### 3. Backend API Development (Edge Functions)
- **What AI Did**: Wrote two Supabase Edge Functions:
  - `sweets` - Complete CRUD operations with search functionality
  - `inventory` - Purchase and restock operations with transaction safety
  - Proper error handling, validation, and CORS headers
- **My Contribution**: Reviewed the code for security vulnerabilities, tested error cases, and verified that admin-only endpoints were properly protected.

#### 4. Frontend Components
- **What AI Did**: Created all React components with TypeScript:
  - Authentication forms with email/password
  - Dashboard with search and filter
  - Product cards with purchase functionality
  - Admin panel with CRUD operations
  - Proper loading states and error handling
- **My Contribution**: Tested user flows, suggested UI improvements, and ensured responsive design worked across devices.

#### 5. Authentication & State Management
- **What AI Did**: Implemented the AuthContext using React Context API, integrated Supabase Auth, and handled session management with proper cleanup.
- **My Contribution**: Tested authentication flows (login, register, logout), verified JWT tokens were properly managed, and checked for memory leaks.

#### 6. Code Organization & Best Practices
- **What AI Did**: Organized code into logical components, created proper TypeScript interfaces, implemented error handling patterns, and followed React best practices.
- **My Contribution**: Reviewed code structure, ensured Single Responsibility Principle was followed, and verified type safety.

#### 7. Documentation
- **What AI Did**: Generated this comprehensive README with setup instructions, API documentation, architecture overview, and this AI usage section.
- **My Contribution**: Reviewed for accuracy, added context about design decisions, and ensured instructions were clear.

### Test-Driven Development Approach

While traditional TDD follows Red-Green-Refactor, working with AI required adaptation:

1. **Red Phase**: I described the feature requirements to Claude, who then generated initial test cases or implementation plans.
2. **Green Phase**: Claude wrote the implementation code based on the requirements, focusing on making it work correctly first.
3. **Refactor Phase**: Together, we reviewed the code for improvements, better error handling, and cleaner organization.

The commit history reflects this iterative process, with Claude noted as co-author on all commits.

### Reflection on AI Impact

#### Positive Impacts
- **Speed**: Development was significantly faster. What would normally take days was completed in hours.
- **Best Practices**: Claude consistently suggested modern best practices (RLS policies, proper TypeScript types, responsive design).
- **Comprehensive**: AI helped ensure nothing was missed - from CORS headers to proper indexes on database tables.
- **Learning**: I learned new patterns and techniques by reviewing AI-generated code and asking questions about implementation details.

#### Challenges
- **Understanding**: I had to carefully review all code to truly understand what was being built, rather than just accepting it.
- **Testing**: While Claude suggested test cases, I still needed to manually test the application thoroughly.
- **Decision Making**: Some architectural decisions required my judgment after discussing trade-offs with Claude.
- **Debugging**: When issues arose, I needed to understand the code well enough to debug effectively.

### Key Takeaways

1. **AI is a powerful co-pilot, not a replacement**: I still needed to understand requirements, make architectural decisions, and verify the implementation.

2. **Review is critical**: Every line of AI-generated code was reviewed for security issues, bugs, and alignment with requirements.

3. **Communication matters**: Clear, specific prompts led to better results. Vague requests produced vague code.

4. **Learning opportunity**: Rather than blindly accepting code, I used this as a chance to learn new patterns and technologies.

5. **Productivity boost**: For well-defined tasks with clear requirements, AI dramatically accelerated development while maintaining quality.

### Interview Discussion Points

I'm prepared to discuss:
- Any specific implementation detail and why it was done that way
- Trade-offs made in architectural decisions
- How I verified the security of the application
- What I learned from working with AI on this project
- How I would extend this application with new features
- Testing strategies for the backend and frontend
- Database design decisions and RLS policy rationale

---

## License

This project was created as part of a TDD kata assignment.

## Author

Developed with assistance from Claude (Anthropic AI) as part of a TDD learning exercise.

---

**Note**: This project demonstrates modern full-stack development practices including authentication, database design, API development, and responsive UI design. All code has been reviewed and tested by the developer, with AI serving as a development accelerator and best practices guide.
