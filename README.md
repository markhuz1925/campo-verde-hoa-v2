# Campo Verde HOA v2

A modern web application for managing Campo Verde Homeowners Association operations, built with React, TypeScript, and Supabase.

## 🏠 Overview

Campo Verde HOA v2 is a comprehensive management system designed to streamline HOA operations including:

- **Resident Management**: Track homeowners and tenants with phase/block/lot information
- **Vehicle Sticker System**: Manage different sticker types (Homeowner, Tenant, Courier, etc.) with pricing
- **Purchase Tracking**: Record sticker sales with detailed driver information and transaction history
- **Secure Authentication**: Role-based access control with Supabase Auth
- **Real-time Updates**: Live data synchronization across all users

## 🚀 Technology Stack

- **Frontend**: React 19.1.0 + TypeScript
- **Build Tool**: Vite 6.3.5 with Hot Module Replacement
- **Routing**: TanStack Router v1.121.27 (file-based routing)
- **State Management**: 
  - TanStack Query v5.80.10 (server state)
  - Zustand v5.0.5 (client state)
  - React Context (authentication)
- **Backend**: Supabase (PostgreSQL + real-time subscriptions)
- **Styling**: TailwindCSS v4.1.10
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project (optional for development)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd campo-verde-hoa-v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup (optional):**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173/`

## 🎯 Features

### Authentication
- Secure sign-in/sign-up with Supabase Auth
- Protected routes with automatic redirects
- Session persistence and management

### Resident Management
- Add, edit, and delete resident records
- Search and filter by phase, block, or lot
- Track resident purchase history
- Detailed resident profiles

### Vehicle Sticker System
- Configurable sticker types and pricing
- Color-coded sticker categories
- Active/inactive status management
- Bulk pricing updates

### Purchase Tracking
- Record sticker purchases with driver details
- Track AF numbers and plate numbers
- Support for renewals and new applications
- Penalty tracking and management

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── app-sidebar.tsx # Main navigation
│   ├── resident-form.tsx
│   └── sticker-form.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Helper functions
├── routes/             # File-based routing
│   ├── __root.tsx     # Root layout
│   ├── index.tsx      # Landing page
│   ├── _auth/         # Authentication routes
│   └── _app/          # Protected app routes
└── types.ts           # TypeScript interfaces
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect your repository** to Netlify
2. **Set build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Add environment variables** in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy!**

### Manual Deployment

```bash
npm run build
# Upload the `dist` folder to your hosting provider
```

## 🗄️ Database Schema

### Core Tables
- `residents` - Homeowner/tenant information
- `products` - Sticker types and pricing
- `purchases` - Transaction records

### Key Relationships
- Residents have many purchases
- Purchases belong to products (stickers)
- Real-time subscriptions for live updates

## 🔐 Authentication Flow

The app uses a sophisticated authentication system:

1. **Public routes**: `/sign-in`, `/sign-up`
2. **Protected routes**: Everything under `/_app/*`
3. **Automatic redirects**: Based on authentication status
4. **Session management**: Persistent login with Supabase

## 🛡️ Development Notes

### Error Handling
- Graceful fallbacks for missing Supabase configuration
- Timeout mechanisms to prevent infinite loading
- Comprehensive error boundaries

### Performance
- Code splitting with TanStack Router
- Optimized bundle sizes
- Efficient re-rendering with React Query

### Type Safety
- Strict TypeScript configuration
- Zod schema validation for all forms
- Type-safe API calls with Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is private and proprietary to Campo Verde Homeowners Association.

## 🆘 Troubleshooting

### Common Issues

**Infinite loading on homepage:**
- Check browser console for errors
- Verify Supabase configuration
- Try hard refresh (Cmd+Shift+R)

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

**Authentication issues:**
- Verify Supabase URL and keys
- Check network connectivity
- Review browser console for auth errors

## 📞 Support

For technical support or feature requests, please contact the development team.
