# Admin Web Application

A modern, feature-rich React-based administrative dashboard for managing the Handyman services platform. Built with TypeScript, Vite, and TanStack React Query for optimal performance and developer experience.

## 🎯 Overview

The Admin Web Application serves as the central hub for platform administrators to manage users, handymen, bookings, reviews, and system health. It provides real-time insights into platform operations and administrative tools for maintaining service quality and user satisfaction.

**Current API Coverage:** ~52% of available OpenAPI endpoints (14+ implemented pages)

## ✨ Features

### Core Management Pages

| Page | Purpose | Key Capabilities |
|------|---------|------------------|
| **Overview** | Dashboard summary | Key metrics, recent activity, system status |
| **Users** | User management | Create, read, update, delete users; search & filter |
| **Auth Users** | Authentication management | List auth accounts, role management, password reset, email verification tracking |
| **Handymen** | Handyman profiles | View profiles, manage skill associations, availability settings |
| **Bookings** | Booking oversight | Track all bookings, filter by status, view booking details |
| **Reviews** | Review management | Filter handyman reviews by rating, search by email/text, view detailed feedback |
| **Skills Catalog** | Service taxonomy | Manage available skills and service categories |
| **Availability** | Schedule management | Monitor handyman availability patterns |
| **Match Logs** | Matching history | View algorithm logs and matching decisions |
| **Notifications** | System notifications | Monitor notification delivery, SSE health checks, status tracking |
| **System Health** | Infrastructure status | API health, database status, background job metrics |

## 🆕 Recent Additions (Latest Revision)

### 1. **Auth Users Management** (`/auth-users`)

**Purpose:** Centralized management of authentication accounts, roles, and security settings.

**Features:**
- **List & Search**: Search auth users by email with instant filtering
- **Role Management**: Update user roles (admin, user, handyman) with real-time changes
- **Password Reset**: Trigger password reset emails for users
- **Email Verification**: View and manage email verification status
- **Delete Accounts**: Remove auth accounts with confirmation
- **Pagination**: Handle large user lists efficiently

**Use Cases:**
- Admin onboarding and access control
- Emergency account deactivation
- Role-based security management
- Support for user account recovery workflows

**Technical Details:**
- Uses TanStack React Query for caching and synchronization
- Implements optimistic updates for better UX
- Built with TypeScript for type safety
- API functions in `packages/api/src/auth.ts`

### 2. **Reviews Management Dashboard** (`/reviews`)

**Purpose:** Comprehensive view and analysis of handyman performance through customer reviews.

**Features:**
- **Review Aggregation**: Automatically fetches all reviews from all handymen
- **Rating Statistics**: Display average rating, total reviews, rating distribution (5-1 stars)
- **Advanced Filtering**:
  - Filter by minimum rating (1-5 stars)
  - Search by handyman email, reviewer email, or review text
  - Combines multiple filters in real-time
- **Detailed Review Viewer**: Overlay panel showing full review context
- **Sorting**: Chronologically sorted by newest first
- **Performance**: Optimized with `Promise.all()` for parallel review fetching

**Use Cases:**
- Identify high-performing handymen
- Investigate low-rated services
- Monitor quality metrics over time
- Support decision-making for performance incentives
- Investigate complaint reports

**Data Model:**
```typescript
HandymanReviewResponse {
  id: number
  booking_id: string
  handyman_email: string
  user_email: string
  rating: number (1-5)
  review_text?: string
  created_at: string
}
```

**Technical Details:**
- Refactored to use `useEffect` + async/await instead of hook loops (fixes React Hooks rules violations)
- Parallel data fetching with `Promise.all()`
- Client-side filtering and sorting for responsive UX
- State management: `allReviewsData` state + filtered computed values

### 3. **Notifications Dashboard** (`/notifications`)

**Purpose:** Monitor system notifications and verify real-time notification delivery mechanisms.

**Features:**
- **Notification Feed**: Paginated list of all system notifications
- **Status Filtering**: Filter by unread, read, archived, or all notifications
- **Search Functionality**: Search by title, body, or message content
- **Notification Types**: Visual indicators for different notification types
- **SSE Health Check**: Test server-sent events (SSE) streaming capability
  - Connection status monitoring (idle, connecting, connected, error)
  - 5-second health check with auto-disconnect
- **Unread Counter**: Real-time display of unread notification count with 30-second refresh
- **Detailed View**: Overlay panel showing full notification payload and metadata

**Use Cases:**
- Verify notification service is functioning
- Monitor SSE stream health for real-time features
- Review platform announcements
- Troubleshoot notification delivery
- Inspect notification payloads for debugging

**Data Structures:**
```typescript
NotificationResponse {
  id: number
  title: string
  body: string
  message: string
  type: string ('booking', 'review', 'system', etc.)
  status: 'unread' | 'read' | 'archived'
  created_at: string
  payload?: any
}
```

**Technical Details:**
- Uses EventSource API for SSE testing
- Automatic query refresh every 30 seconds for unread count
- Filter state management with URL synchronization
- Query key composition for proper cache invalidation

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19.2.0 |
| **Language** | TypeScript 5.9.3 |
| **Build Tool** | Vite 7.3.1 |
| **State Management** | TanStack React Query 5.90.21 |
| **Routing** | React Router 7.13.1 |
| **UI Framework** | Material-UI 7.3.9 |
| **Styling** | Emotion (CSS-in-JS) |
| **API Client** | Generated from OpenAPI 3.1.0 spec |

### Directory Structure

```
apps/admin-web/
├── src/
│   ├── auth/
│   │   ├── LoginPage.tsx          # Authentication entry point
│   │   ├── RequireAdmin.tsx       # Route protection
│   │   └── session.ts            # Session management
│   ├── layout/
│   │   ├── AdminLayout.tsx        # Main layout wrapper
│   │   └── Sidebar.tsx            # Navigation menu
│   ├── routes/                    # Page components (one per feature)
│   │   ├── OverviewPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── AuthUsersPage.tsx      # ✨ NEW
│   │   ├── BookingsPage.tsx
│   │   ├── HandymenPage.tsx
│   │   ├── ReviewsManagementPage.tsx  # ✨ NEW
│   │   ├── SkillsCatalogPage.tsx
│   │   ├── AvailabilityPage.tsx
│   │   ├── MatchLogsPage.tsx
│   │   ├── NotificationsDashboard.tsx  # ✨ NEW
│   │   └── SystemHealthPage.tsx
│   ├── lib/
│   │   ├── api.ts                # API client factory
│   │   ├── adminFormat.ts        # Formatting utilities
│   │   ├── queryClient.ts        # React Query configuration
│   │   ├── systemHealth.ts       # Health check utilities
│   │   └── useAsyncOperation.ts  # Common async hook
│   ├── ui/                       # Reusable components
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── DataTable.tsx
│   │   ├── OverlayPanel.tsx
│   │   ├── Page.tsx
│   │   └── StatCard.tsx
│   ├── App.tsx                   # Route definitions
│   ├── main.tsx                  # Entry point
│   ├── theme.tsx                 # Theme provider
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

### Data Flow

```
┌─────────────────┐
│   React Pages   │
└────────┬────────┘
         │ useQuery
         ▼
┌─────────────────┐
│ React Query     │ (Caching & Sync)
└────────┬────────┘
         │ API functions
         ▼
┌─────────────────┐
│ API Layer       │ (@smart/api)
│ (TypeScript)    │ Generated from OpenAPI spec
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Backend API     │
│ (FastAPI)       │ HTTP on port 8000
└─────────────────┘
```

### API Integration

All API interactions are managed through the `@smart/api` package (workspace dependency), which provides:

- **Type-safe API functions** auto-generated from OpenAPI 3.1.0 spec
- **Centralized client creation** via `createApiClient()` factory
- **Token injection** through token provider pattern
- **Standardized request/response handling**

Recent additions to API layer:
```typescript
// packages/api/src/auth.ts - New auth management functions
adminListAuthUsers(api, params)          // List with pagination
adminGetAuthUser(api, userId)            // Get by ID
adminGetAuthUserByEmail(api, email)      // Get by email
adminUpdateAuthUser(api, userId, body)   // Update password/roles
adminDeleteAuthUser(api, userId)         // Delete user
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 9.0+ (this monorepo uses pnpm workspaces)
- **Backend API** running on `http://localhost:8000`

### Installation

1. **Install dependencies** (from monorepo root):
   ```bash
   pnpm install
   ```

2. **Verify installation**:
   ```bash
   pnpm -C apps/admin-web typecheck
   ```

### Running the App

#### Development Mode

```bash
# From monorepo root
pnpm -C apps/admin-web dev

# Or from apps/admin-web directory
cd apps/admin-web
pnpm dev
```

The app will start on `http://localhost:5173` (Vite default).

**Development Features:**
- Hot Module Replacement (HMR) enabled
- Fast Refresh for instant changes
- Source maps for debugging
- TypeScript checking enabled

#### Production Build

```bash
# Build optimized bundle
pnpm -C apps/admin-web build

# Preview production build locally
pnpm -C apps/admin-web preview
```

**Build Output:**
- Location: `dist/` directory
- Format: Optimized JavaScript, CSS, and static assets
- Size: ~500KB (gzipped)

## 👨‍💻 Development Guide

### Running the Full Monorepo (All Apps)

```bash
# From monorepo root - runs all apps with Turbo
pnpm run dev

# This starts:
# - admin-web (http://localhost:5173)
# - mobile (Expo on mobile device)
# - Other apps as configured
```

### Code Quality

```bash
# Type checking
pnpm -C apps/admin-web typecheck

# Linting
pnpm -C apps/admin-web lint

# Linting with fixes
pnpm -C apps/admin-web lint -- --fix
```

### Project Structure Conventions

**Pages vs Components:**
- `/routes/*.tsx` → Full page components (connected to React Query)
- `/ui/*.tsx` → Reusable UI components (pure, no data fetching)

**Naming Conventions:**
- Page components: `<Feature>Page.tsx` (e.g., `UsersPage.tsx`)
- Utility functions: `camelCase.ts` (e.g., `adminFormat.ts`)
- UI components: `PascalCase.tsx` (e.g., `DataTable.tsx`)

### Common Development Patterns

#### Adding a New Page

1. Create component in `/routes/<FeatureName>Page.tsx`:
   ```typescript
   import { useQuery } from "@tanstack/react-query";
   import { someApiFunction } from "@smart/api";
   import { createApiClient } from "../lib/api";
   
   export default function FeatureNamePage() {
     const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
     
     const query = useQuery({
       queryKey: ["feature-name"],
       queryFn: () => someApiFunction(api, params),
     });
     
     return (
       <Page title="Feature Name" subtitle="Description">
         {/* Page content */}
       </Page>
     );
   }
   ```

2. Add route to `App.tsx`:
   ```typescript
   <Route path="feature-name" element={<FeatureNamePage />} />
   ```

3. Add navigation link to `Sidebar.tsx`:
   ```typescript
   ["/feature-name", "Feature Name"]
   ```

#### Using React Query

```typescript
// Basic query
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["resource-key"],
  queryFn: () => apiFunction(api, params),
});

// With filtering and search
const filteredData = useMemo(() => {
  return data?.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];
}, [data, search]);

// Refetching
<button onClick={() => refetch()}>Refresh</button>

// Error handling
{error && <div>Error: {error.message}</div>}
```

#### Creating Reusable Components

```typescript
// ui/MyComponent.tsx
interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export default function MyComponent({ title, children }: MyComponentProps) {
  return (
    <Card title={title}>
      {children}
    </Card>
  );
}
```

## 📋 Recent Fixes & Improvements

### React Hooks Compliance

**Issue:** ReviewsManagementPage was calling `useQuery` inside a `.map()` loop, violating React's Rules of Hooks.

**Solution:** Refactored to use `useEffect` with `Promise.all()` for parallel fetching:
```typescript
// ❌ Before (broken)
const reviewsQueries = (handymenQ.data ?? []).map(handyman => 
  useQuery({ ... }) // Hook in loop - WRONG
);

// ✅ After (fixed)
useEffect(() => {
  const fetchAllReviews = async () => {
    const reviewsPromises = handymenQ.data.map(handyman =>
      listHandymanReviews(api, handyman.email, ...)
    );
    const allReviews = await Promise.all(reviewsPromises);
    setAllReviewsData(allReviews.flat());
  };
  fetchAllReviews();
}, [handymenQ.data, api]);
```

### API Contract Alignment

**Fixed Field Mappings:**
- UsersPage: `full_name` → `first_name` + `last_name` + `phone`
- ReviewsManagementPage: `reviewer_name` → `user_email`, `comment` → `review_text`

These ensure strict TypeScript compliance with the OpenAPI schema.

## 🔌 API Endpoints Used (By Page)

### Auth Users Page
- `GET /admin/auth-users?limit=&offset=` - List all auth users
- `GET /admin/auth-users/{user_id}` - Get auth user details
- `PUT /admin/auth-users/{user_id}` - Update auth user (password, roles)
- `DELETE /admin/auth-users/{user_id}` - Delete auth user
- `GET /admin/auth-users/search?email=` - Search by email

### Reviews Management
- `GET /handymen?limit=&offset=` - List handymen
- `GET /handymen/{email}/reviews?limit=&offset=` - Get reviews for handyman

### Notifications Dashboard
- `GET /me/notifications?status=&limit=` - List notifications
- `GET /me/notifications/unread-count` - Get unread count
- `GET /me/notifications/stream` - SSE stream (Server-Sent Events)

### Users Page
- `GET /admin/users?limit=&offset=` - List platform users
- `POST /admin/users` - Create new user
- `PUT /admin/users/{user_id}` - Update user
- `DELETE /admin/users/{user_id}` - Delete user

## 🧪 Testing & Verification

### Manual Testing Checklist

- [ ] Auth Users page loads and displays users
- [ ] Can search for users by email
- [ ] Can update user roles
- [ ] Can trigger password reset
- [ ] Reviews page loads all handymen reviews
- [ ] Can filter reviews by rating
- [ ] Can search reviews by email/text
- [ ] Notifications load and display correctly
- [ ] SSE health check indicator shows status
- [ ] Can filter notifications by status

### API Connectivity

Verify backend connectivity:
```bash
curl http://localhost:8000/health
# Should return 200 with health status
```

## 📚 Dependencies

### Core Dependencies
- **react** (19.2.0) - UI library
- **react-router-dom** (7.13.1) - Client routing
- **@tanstack/react-query** (5.90.21) - Server state management & caching
- **@mui/material** (7.3.9) - Material Design components
- **@emotion/react** (11.14.0) - CSS-in-JS styling

### Workspace Dependencies
- **@smart/api** - Type-safe API client (generated from OpenAPI)
- **@smart/core** - Shared constants and utilities
- **@smart/theme** - Design tokens and theme

## 🚧 Known Limitations

1. **API Coverage**: Only ~52% of available OpenAPI endpoints implemented
2. **Real-time Updates**: Notifications use polling; WebSocket would be more efficient
3. **Batch Operations**: No bulk edit/delete functionality yet
4. **Data Export**: No data export (CSV, PDF) functionality
5. **Permissions**: Simple admin/user split; more granular permissions could be added

## 🔮 Future Enhancements

- [ ] Implement missing OpenAPI endpoints (Skill API, advanced filters)
- [ ] Add broadcasting API support for admin messages to all users
- [ ] WebSocket integration for real-time updates instead of polling
- [ ] Bulk operations (delete multiple users, update multiple handymen)
- [ ] Data export functionality (CSV, PDF, Excel)
- [ ] Advanced reporting and analytics dashboard
- [ ] Audit logging for admin actions
- [ ] Role-based access control (RBAC) at page level
- [ ] Dark mode support
- [ ] Mobile-responsive admin interface

## 🐛 Troubleshooting

### Page Not Loading

**Problem:** Blank page or infinite loading
- Check browser console for errors
- Verify backend API is running on `http://localhost:8000`
- Check network tab in DevTools to see API requests

### API Errors (401, 403)

**Problem:** Authentication or authorization errors
- Verify token is stored in localStorage
- Check token expiration
- Try logging out and back in
- Check backend API logs for details

### React Dev Tools Issues

**Problem:** Too many re-renders or performance issues
- Check React Query DevTools in browser
- Look for duplicate queries or cache misses
- Verify no console warnings about hooks

### Styling Issues

**Problem:** Styles not applying correctly
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Check CSS variable definitions in `theme.tsx`

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend API logs for errors
3. Check browser console and network tab
4. File an issue with error details and reproduction steps

## 📄 License

This project is part of the Handyman services platform. See LICENSE file in monorepo root.

---

**Last Updated:** March 2026
**Status:** Active Development

---

# Mobile Application

A cross-platform mobile application built with React Native and Expo that enables users to find handymen services and allows handymen to manage their jobs and availability. Available on iOS, Android, and web.

## 🎯 Mobile App Overview

The Mobile application provides a consumer-facing and service-provider experience for the Handyman platform. Users can discover and book handymen for various services, while handymen can manage job bookings, update their availability, and build their professional profiles.

**Current Platform Coverage:** 65% of key API endpoints implemented across both user and handyman roles

## 📱 User Experience (Service Consumers)

### Core User Screens

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| **Find Screen** | Search and match handymen | Skill selection, location-based search, date/time scheduling, map view, list view, handyman profiles, direct booking |
| **Bookings** | Current and past bookings | Booking status tracking, history, cancellation |
| **Discovery** | Browse services & recommendations | Placeholder for recommended services and categories |
| **Chat** | In-app messaging | Placeholder for handyman communication |
| **Profile** | User account management | Edit profile, settings, preferences |

#### Find Screen Features (Detailed)

**The Find screen is the core feature allowing users to discover and book handymen.**

**Functionality:**
1. **Skill Selection**
   - Browse complete skill catalog
   - Search skills by keyword
   - Single skill selection per booking
   - Visual skill categories

2. **Time & Date Selection**
   - Calendar date picker
   - Start and end time selection
   - Automatic time validation (end > start)
   - Default 1-hour buffer from current time

3. **Location-Based Matching**
   - GPS location detection (requires permission)
   - Manual location override
   - Radius-based search
   - Map visualization of results

4. **Search & Matching Algorithm**
   - Calls backend `/match` endpoint with:
     - User location (latitude, longitude)
     - Selected skill
     - Time window (desired_start, desired_end)
     - Optional job description
   - Returns ranked list of available handymen

5. **Results Display**
   - Map view showing handymen locations
   - List view with handymen details
   - Sorting by distance or rating
   - Individual handymen profile cards with:
     - Photo and name
     - Rating and review count
     - Distance from user
     - Hourly rate (if applicable)
     - Quick action buttons

6. **Handyman Profile View**
   - Detailed profile modal/screen
   - Biography and skills
   - Average rating and review count
   - Photo gallery
   - Past booking history
   - Customer reviews with ratings
   - Direct booking button

7. **Booking Creation**
   - Pre-filled with search parameters
   - Optional job description from initial search
   - Final confirmation
   - Real-time booking status confirmation
   - Error handling and retry logic

**Use Cases:**
- Quick handyman booking for emergency repairs
- Scheduled service booking weeks in advance
- Background check and rating research before booking
- Price negotiation through detailed profiles
- Finding specialists for complex jobs

**Technical Implementation:**
- Uses `match()` API endpoint for intelligent handymen matching
- Parallel API calls for loading profile and reviews
- Error boundaries with user-friendly alerts
- Loading states during data fetching
- Optimistic UI updates

### Notifications System

**Features:**
- Real-time push notifications for:
  - New booking requests (for handymen)
  - Booking status changes
  - Messages from handymen or users
  - System announcements
- Notification list with filtering
- Mark as read / Archive functionality
- 30-second automatic refresh for unread count
- Unread count badge on tab bar
- Tap notifications to view details

**Data:**
```typescript
NotificationItem {
  id: number
  title: string
  body: string
  message: string
  type: 'booking' | 'review' | 'message' | 'system'
  status: 'unread' | 'read' | 'archived'
  created_at: string
  payload?: any
}
```

### Authentication & Registration

**Login Flow:**
1. Email and password entry
2. Token-based authentication (JWT)
3. Session persistence via secure storage
4. Auto-login on app restart

**Registration Flow (User):**
1. **Role Selection**: Choose "User" role
2. **Personal Information**:
   - First name, last name
   - Email (unique)
   - Password (with confirmation)
   - Phone number
3. **Registration Confirmation**
4. Auto-login after successful registration

**Features:**
- Form validation with helpful error messages
- Password strength indicator
- Email verification (optional)
- Secure token storage using `expo-secure-store`

## 🔧 Handyman Experience (Service Providers)

### Core Handyman Screens

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| **Jobs Screen** | Manage booking requests | Accept/reject jobs, view job details, mark complete, track earnings |
| **Availability** | Control working schedule | Set available hours, block-out dates, working days |
| **Discovery** | Browse job requests | Browse available jobs, filter by skill/location |
| **Chat** | Client communication | In-app messaging with clients |
| **Profile** | Professional profile | Skills, bio, rates, reviews, photos, portfolio |

#### Jobs Screen Features (Detailed)

**The Jobs screen is where handymen manage their work and earnings.**

**Booking Lifecycle:**
1. **Incoming** (Requests)
   - New booking requests from users
   - Display job details:
     - Skill required
     - Date and time window
     - Location and distance
     - Job description
     - Client rating (if available)
   - Actions: Accept or Reject
   - Status: `incoming`

2. **Confirmed** (Accepted)
   - Handyman has accepted, awaiting completion
   - Cannot reject at this stage
   - Display full booking details
   - Navigation to job location integration
   - Status: `confirmed`

3. **In Progress**
   - Handyman started working on the job
   - Display elapsed time
   - Time-tracking information
   - Status: `in_progress`

4. **Awaiting Completion Review**
   - Handyman marked job as complete
   - Awaiting client approval
   - Cannot accept new rejections
   - Status: `awaiting_completion_review`
   - Actions: View completion details

5. **Completed**
   - Client confirmed job completion
   - Earnings recorded
   - Ready for review by client
   - Status: `completed`

6. **Rejected**
   - Job rejected by handyman or client
   - Cannot take further action
   - Status: `rejected`

**Features:**
- **Sectioned List View**: Jobs grouped by status
- **Color-coded Status Badges**: Visual indication of job state
- **Quick Actions**: Accept, reject, or complete directly
- **Job Details Modal**: Full information for each booking
- **Earnings Tracking**: Total earnings display
- **Job Count**: Summary of active and completed jobs
- **Real-time Updates**: Notifications when new jobs arrive

**Technical Implementation:**
```typescript
getMyJobs()                    // Get all handyman's jobs
confirmBooking(api, id)        // Accept a booking
rejectBookingCompletion()      // Reject completed job
completeBookingHandyman(api, id) // Mark as complete
```

#### Availability Management

**Features:**
- Set daily availability windows
- Block out dates when unavailable
- Recurring availability patterns
- Timezone support
- Quick toggle: Available / Not Available
- Estimated response time tracking

**Use Cases:**
- Prevent bookings during personal time
- Schedule around other commitments
- Seasonal availability patterns
- Vacation blocking

---

## 🏗️ Mobile App Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.83.2 |
| **Platform** | Expo 55.0.5 (iOS, Android, Web) |
| **Language** | TypeScript 5.9.3 |
| **State Management** | TanStack React Query 5.90.21 |
| **Navigation** | React Navigation 7.x |
| **Location Services** | Expo Location 55.1.3 |
| **Secure Storage** | Expo Secure Store 55.0.9 |
| **UI Framework** | React Native built-ins, Custom components |
| **Icons** | Expo Vector Icons (Material Icons) |
| **API Client** | Generated from OpenAPI 3.1.0 spec |

### Directory Structure

```
apps/mobile/
├── src/
│   ├── auth/
│   │   ├── LoginScreen.tsx              # Auth entry point
│   │   ├── RegisterRolePicker.tsx       # User/Handyman selection
│   │   ├── RegisterUserOnboardingForm.tsx     # User registration
│   │   ├── RegisterHandymanOnboardingForm.tsx # Handyman registration
│   │   ├── SessionProvider.tsx          # Session context
│   │   ├── registerTypes.ts             # Registration type definitions
│   │   └── session.ts                   # Token management
│   ├── screens/
│   │   ├── user/
│   │   │   ├── FindScreen.tsx           # Core search & booking
│   │   │   ├── FindScreen/
│   │   │   │   ├── SearchFilters.tsx    # Filter UI
│   │   │   │   ├── MapResults.tsx       # Map visualization
│   │   │   │   ├── HandymenList.tsx     # Results list
│   │   │   │   ├── SkillSelector.tsx    # Skill picker
│   │   │   │   ├── HandymanDetail.tsx   # Profile modal
│   │   │   │   └── utils.ts             # Helpers
│   │   │   ├── BookingsPlaceholder.tsx  # Booking history
│   │   │   └── ProfilePlaceholder.tsx   # User profile
│   │   ├── handyman/
│   │   │   ├── JobsScreen.tsx           # Job management
│   │   │   ├── AvailabilityPlaceholder.tsx  # Availability settings
│   │   │   ├── HandymanSettings.tsx     # Profile settings
│   │   │   └── ProfilePlaceholder.tsx   # Profile view
│   │   ├── NotificationsScreen.tsx      # Notifications
│   │   ├── ChatPlaceholderScreen.tsx    # Chat (placeholder)
│   │   └── DiscoveryPlaceholderScreen.tsx # Discovery (placeholder)
│   ├── navigation/
│   │   ├── RootNavigator.tsx            # Main navigation orchestrator
│   │   ├── UserTabs.tsx                 # User tab navigation
│   │   ├── HandymanTabs.tsx             # Handyman tab navigation
│   │   ├── RolePickerScreen.tsx         # Dual-role selection
│   │   └── HandymanTabsNavigator.tsx    # Handyman nav wrapper
│   ├── context/
│   │   └── SearchContext.tsx            # Search state management
│   ├── lib/
│   │   ├── api.ts                       # API client factory
│   │   ├── dateTime.ts                  # Date utilities
│   │   ├── coordinates.ts               # Location helpers
│   │   ├── profileForm.ts               # Form validation
│   │   ├── availability.ts              # Availability logic
│   │   ├── bookingSections.ts           # Job lifecycle states
│   │   ├── tabBarConfig.ts              # Tab bar styling
│   │   └── queryClient.ts               # React Query setup
│   ├── hooks/
│   │   ├── useAsyncOperation.ts         # Async wrapper with errors
│   │   ├── useBottomGuard.ts            # Safe area helper
│   │   └── useFormState.ts              # Form state management
│   ├── location/
│   │   └── AppLocationProvider.tsx      # GPS context
│   ├── notifications/
│   │   ├── NotificationsProvider.tsx    # Notification context
│   │   └── NotificationsScreen.tsx      # Notification viewer
│   ├── theme/
│   │   ├── index.tsx                    # Theme context
│   │   ├── palette.ts                   # Color definitions
│   │   └── appChrome.ts                 # Background images
│   ├── ui/
│   │   ├── primitives.tsx               # Core UI components
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── ScreenHeader.tsx             # Screen title
│   │   ├── ModalScreen.tsx              # Modal wrapper
│   │   ├── BrandWordmark.tsx            # Logo component
│   │   ├── SkillCategorySections.tsx    # Skill browser
│   │   └── [other UI components]
│   ├── App.tsx                          # Root app component
│   ├── main.tsx                         # Entry point
│   └── theme.tsx                        # Theme provider
├── App.tsx                              # Expo entry point
├── package.json
├── app.json                             # Expo config
├── tsconfig.json
└── assets/
    └── skills/
        └── [skill icons]
```

### Data Flow Architecture

```
┌──────────────────┐
│  Native Platform │ (iOS/Android/Web)
└────────┬─────────┘
         │
┌────────▼──────────────┐
│ React Native Components│
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│  React Context        │ (Session, Search, Notifications)
│  + React Query        │ (Caching & Server State)
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│  API Functions        │ (@smart/api)
│  (TypeScript)         │ Generated from OpenAPI
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│  HTTP Layer           │
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│  Backend API          │
│  (FastAPI)            │ HTTP on port 8000
└───────────────────────┘
```

### Context Providers

The app uses several React Context providers for state management:

1. **SessionProvider**
   - Manages authentication state
   - Stores and retrieves JWT tokens
   - Provides user email and role
   - Auto-login on app restart

2. **AppLocationProvider**
   - GPS coordinates context
   - Location permission handling
   - Geolocation service setup

3. **ThemeProvider**
   - Dark/light mode switching
   - Color palette and design tokens
   - System theme detection

4. **NotificationsProvider**
   - Unread notification count
   - Latest notification tracking
   - Polling for notification updates

5. **SearchProvider**
   - Search query state
   - Result filtering
   - Filter persistence

---

## 🚀 Getting Started with Mobile App

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 9.0+ (monorepo package manager)
- **Expo CLI** (install globally: `npm install -g eas-cli`)
- **Backend API** running on `http://localhost:8000`
- **For iOS**: Xcode (11.0 or later)
- **For Android**: Android Studio or pre-installed emulator
- **For physical device**: Expo Go app installed

### Installation

1. **Install dependencies** (from monorepo root):
   ```bash
   pnpm install
   ```

2. **Verify installation**:
   ```bash
   pnpm -C apps/mobile typecheck
   ```

### Running the App

#### Development Mode - Web

```bash
# From monorepo root
pnpm -C apps/mobile web

# Or from apps/mobile directory
cd apps/mobile
pnpm web
```

The app will start in your browser on `http://localhost:19006`

**Features:**
- Hot reloading for instant changes
- DevTools integration
- Easy testing on desktop

#### Development Mode - iOS Simulator

```bash
cd apps/mobile
pnpm ios

# Or if you have a simulator already open
expo start --ios
```

**Requirements:**
- Xcode with iOS simulator
- M1/M2 Mac recommended for performance

#### Development Mode - Android Emulator

```bash
cd apps/mobile
pnpm android

# Or manually
expo start --android
```

**Requirements:**
- Android Studio with emulator configured
- Or: Genymotion Android emulator
- Intel/AMD processor with virtualization enabled

#### Development Mode - Physical Device

1. **Install Expo Go** from App Store or Play Store

2. **Tunnel Mode** (Easiest):
   ```bash
   cd apps/mobile
   pnpm dev
   ```
   Then scan the QR code with Expo Go

3. **LAN Mode** (Local Network):
   ```bash
   pnpm dev -- --localhost
   ```
   Connects to your machine on local network

4. **USB Mode** (Direct Connection):
   ```bash
   pnpm dev -- --tunnel
   ```
   Device communicates via Expo servers

#### Production Build

```bash
# Build for iOS
pnpm -C apps/mobile build:ios

# Build for Android
pnpm -C apps/mobile build:android

# Build for web
pnpm -C apps/mobile build:web
```

**Configuration:**
- See `app.json` for Expo configuration
- Update app version before each release
- Configure app icons and splash screens

### Configuration

**API Base URL:**
Edit `apps/mobile/src/lib/api.ts`:
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
```

**For Production:**
```bash
EXPO_PUBLIC_API_URL=https://api.handyman.example.com pnpm dev
```

---

## 📲 Platform-Specific Features

### iOS Specific

- NSLocationWhenInUseUsageDescription required in `app.json`
- Privacy permissions for location and photo library
- Apple App Store distribution configuration

### Android Specific

- Location permission (fine and coarse)
- Camera and microphone permissions
- Android version targeting (API level 21+)

### Web Specific

- Limited geolocation support (user prompt)
- Responsive design for tablet/desktop
- Service worker support (optional)

---

## 👥 Role-Based Features

### User Role Features
✅ Skill-based handymen search  
✅ Location-aware matching  
✅ Date/time scheduling  
✅ Direct booking creation  
✅ Booking history tracking  
✅ Handymen profile browsing  
✅ Reviews and ratings viewing  
❌ In-app chat (placeholder)  
❌ Bookmarks/favorites (not implemented)  
❌ Payment integration (not implemented)  

### Handyman Role Features
✅ Incoming job request management  
✅ Job acceptance/rejection  
✅ Job completion marking  
✅ Earnings tracking  
✅ Professional profile setup  
✅ Skills management  
❌ Availability calendar (placeholder)  
❌ Performance analytics (not implemented)  
❌ Payout management (not implemented)  

### Shared Features
✅ Push notifications  
✅ Notification management (archive, read)  
✅ User profile editing  
✅ Secure authentication  
✅ Dark/light mode support  
❌ In-app chat (placeholder)  
❌ Messaging system (placeholder)  

---

## 🔌 Mobile API Endpoints Used

### Authentication
- `POST /login` - User login
- `POST /register/user` - User registration
- `POST /register/handyman` - Handyman registration with skills

### User Endpoints
- `GET /me` - Current user profile
- `PUT /me` - Update user profile
- `GET /me/notifications?limit=&status=` - List notifications
- `PUT /me/notifications/{id}/read` - Mark notification read
- `PUT /me/notifications/{id}/archive` - Archive notification
- `POST /match` - Find handymen (core search)

### Handyman Endpoints
- `GET /me/jobs?limit=&offset=` - Get handyman's jobs
- `POST /bookings/{id}/confirm` - Accept booking
- `POST /bookings/{id}/reject` - Reject booking
- `POST /bookings/{id}/complete` - Mark job complete
- `GET /handymen/me` - Handyman profile
- `PUT /handymen/me` - Update handyman profile
- `POST /handymen/me/skills` - Manage skills
- `GET /handymen/me/availability` - Get availability

### Shared Endpoints
- `GET /handymen/{email}` - Get handyman details
- `GET /handymen/{email}/reviews` - Get handyman reviews
- `GET /skills/catalog/flat` - Get all skills
- `GET /bookings/{id}` - Get booking details

---

## 🧪 Testing Mobile App

### Manual Testing Checklist

**User Role:**
- [ ] Login with user credentials
- [ ] Register new user account
- [ ] Select skill in Find screen
- [ ] Enable location services
- [ ] View matching handymen on map
- [ ] View handymen in list
- [ ] View handyman profile and reviews
- [ ] Create booking successfully
- [ ] View booking in Bookings tab
- [ ] Check notifications
- [ ] Switch to handyman role (if available)

**Handyman Role:**
- [ ] Login as handyman
- [ ] View incoming jobs
- [ ] Accept job request
- [ ] Reject job request
- [ ] Mark job as complete
- [ ] View job history
- [ ] Setup availability (if implemented)
- [ ] View and edit profile
- [ ] Manage skills
- [ ] Check notifications

**Common:**
- [ ] Toggle dark/light mode
- [ ] Check responsive layout on different screen sizes
- [ ] Test location permission flow
- [ ] Logout and re-login
- [ ] Check token persistence
- [ ] Verify error messages are helpful
- [ ] Test on slow network (DevTools throttle)

### Performance Testing

```bash
# Profile performance in production build
expo start --production

# Check bundle size
expo-cli bundle --platform ios/android/web
```

### Device Testing

Always test on:
- iPhone (various sizes: SE, 12, 14 Pro Max)
- Android (various versions: Android 12, 13, 14)
- Tablets (iPad, Android tablets)
- Different network conditions (WiFi, 4G, 3G)

---

## 📚 Dependencies

### Core Mobile Dependencies
- **react** (19.2.0) - UI library
- **react-native** (0.83.2) - Native mobile framework
- **expo** (55.0.5) - Platform and build tools
- **@react-navigation/native** (7.1.33) - Navigation
- **@react-navigation/bottom-tabs** (7.15.5) - Tab navigation
- **@tanstack/react-query** (5.90.21) - Server state management
- **expo-location** (55.1.3) - GPS services
- **expo-secure-store** (55.0.9) - Secure token storage
- **@expo/vector-icons** (15.1.1) - Material Icons

### Location Services
- **expo-location** - Permission handling, getCurrentPositionAsync()
- Supports foreground and background location

### Storage
- **expo-secure-store** - Encrypted token storage (platform-native)
- **AsyncStorage** - App preferences and cache

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** "Failed to connect to backend API"
- Verify backend is running on `http://localhost:8000`
- Check API_BASE_URL in `apps/mobile/src/lib/api.ts`
- For physical device: use actual IP instead of localhost
  ```typescript
  export const API_BASE_URL = 'http://192.168.1.100:8000';
  ```
- Check firewall and network permissions

### Location Permission Issues

**Problem:** "Location access denied" or "Tap 'Use My Location' first"
- Go to device Settings > Handyman app > Permissions > Location
- Set location permission to "Allow"
- Clear app cache and retry
- For iOS: Ensure NSLocationWhenInUseUsageDescription in Info.plist

### Authentication Issues

**Problem:** "Login failed" or "Invalid token"
- Verify backend auth service is running
- Check email and password are correct
- Clear secure storage: Settings > Clear app data
- Check token expiration: try logging out and back in

### Performance Issues

**Problem:** Slow performance, freezing, or crashes
- Close other apps to free memory
- Clear app cache: Settings > Storage > Clear cache
- Rebuild app: `expo prebuild --clean`
- Check React Query DevTools for excessive queries
- Profile in native debugger (XCode/Android Studio)

### Build Failures

**Problem:** Build fails or doesn't complete
- Clear cache: `pnpm store prune`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Clear Expo cache: `expo prebuild --clean`
- Check TypeScript errors: `pnpm typecheck`

### Hot Reload Not Working

**Problem:** Changes not reflecting after save
- Ensure dev server is running
- Check that file path is correct
- Try hard refresh: Shake device or Cmd+Shift+H
- Restart dev server and Expo Go app

---

## 🚀 Deployment

### EAS Build (Recommended)

```bash
# Login to EAS
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to store
eas submit --platform ios
eas submit --platform android
```

### Configuration

Edit `app.json`:
```json
{
  "expo": {
    "name": "Handyman App",
    "slug": "handyman",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.handyman.app",
      "supportsTabletMode": true
    },
    "android": {
      "package": "com.handyman.app",
      "versionCode": 1
    }
  }
}
```

---

## 📊 Monorepo Scripts

From monorepo root, run both web and mobile together:

```bash
# Start all development servers
pnpm run dev

# This starts:
# - admin-web on http://localhost:5173
# - mobile on http://localhost:19006
# - Other configured apps

# Build everything
pnpm run build

# Type check everything
pnpm run typecheck

# Lint everything
pnpm run lint
```

---

## 📞 Support

For mobile app issues or questions:
1. Check the troubleshooting section above
2. Review backend API logs for errors
3. Check device console logs (XCode/Android Studio)
4. Check Expo logs: `expo logs`
5. File an issue with:
   - Device model and OS version
   - Expo SDK version
   - Error messages and screenshots
   - Steps to reproduce

---

## 🔮 Future Enhancements

### User Features
- [ ] Save favorite handymen
- [ ] Bookmark favorite skills/searches
- [ ] Payment integration and digital wallets
- [ ] Ratings and reviews submission
- [ ] Job history analytics
- [ ] In-app messaging with handymen
- [ ] Group bookings

### Handyman Features
- [ ] Advanced availability calendar
- [ ] Performance dashboard and analytics
- [ ] Earnings reports and payout management
- [ ] Client management and CRM
- [ ] Portfolio/gallery upload
- [ ] Certifications and badges
- [ ] Schedule conflicts detection

### Cross-Platform
- [ ] Push notifications (FCM/APNs)
- [ ] Real-time chat with WebSocket
- [ ] Offline mode with sync
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Video call integration
- [ ] Payment processing
- [ ] Advanced analytics

---

## 🧠 Codebase Architecture Notes

The following notes document non-obvious design decisions and behavioral details across the codebase.

### Availability Pipeline (`apps/mobile/src/lib/availability.ts`)

- **Weekday type** uses the JS `Date.getDay()` convention: Sunday = 0, Saturday = 6.
- **`RecurringRule`** defines weekdays + start/end hour-minute pairs. Rules are materialised into concrete `AvailabilitySlot` entries over a 14-day horizon.
- **`toDateKey()`** returns `"YYYY-MM-DD"` for a `Date` or ISO string.
- **`slotsOverlap()`** uses exclusive boundary comparison (touching endpoints are not considered overlapping).
- **`removeOverlaps()`** keeps the first occurrence when conflicts are found.
- **`materializeSchedule()`** runs the full pipeline: expand recurrence → apply blockouts → deduplicate → remove overlaps → sort.
- **`previewGenerateCount()`** computes how many new slots would be generated without actually committing them.

### SSE & Notifications (`apps/mobile/src/notifications/NotificationsProvider.tsx`)

- The `EventSource` API does not expose HTTP status codes. On any error (401, network drop, etc.) the connection is closed and a reconnect is scheduled with exponential backoff.
- When a token has expired, the next `connect()` call fetches a fresh token via `getStoredToken()` (which reads from SecureStore after the ApiClient refresh cycle).
- Backoff resets on **any** successful message including `"ready"` / `"ping"` heartbeats.
- Malformed SSE payloads are silently ignored.

### Role-Based Navigation (`apps/mobile/src/screens/NotificationsScreen.tsx`)

- After a role switch, `roleMode` updates and a `useEffect` fires the pending navigation that was deferred while waiting for the new tab navigator to mount.
- When the target role differs from the current mode, the app switches roles first and defers navigation to the effect. If the user lacks the target role, it fails silently.

### Session Management (`apps/mobile/src/auth/SessionProvider.tsx`)

- Server logout is best-effort; local token clearing always proceeds even if the server call fails.

### Modal Architecture (`apps/mobile/src/ui/ModalScreen.tsx`)

- The `ModalScreen` component consolidates all modal presentation logic into a single reusable component rather than duplicating modal styling across multiple screens.

### Admin Reviews (`apps/admin-web/src/routes/ReviewsManagementPage.tsx`)

- Reviews are fetched using `useEffect` + `Promise.all()` instead of calling `useQuery` inside a `.map()` loop, which would violate React's Rules of Hooks.

### Hooks

- **`useFormState`** reduces boilerplate from multiple `useState` hooks to a single state object. Usage: `const { data, patch, reset } = useFormState({ name: '', email: '' })`.
- **`useAsyncOperation`** provides loading state, error handling, retry logic with exponential delay, and granular callbacks for any async operation.

### Styling

- **`createStyles()`** in `styles.ts` is the centralized style factory — all components access styles through the `useStyles()` hook to maintain consistent design tokens.
- **`createTabBarConfig()`** is the single source of truth for tab bar styling, eliminating duplication between `UserTabs` and `HandymanTabs`.

### Coordinates (`apps/mobile/src/lib/coordinates.ts`)

- `extractDeviceCoordinates()` centralises coordinate handling to avoid duplication.
- `parseCoordinate()` validates geographic bounds (latitude: -90..90, longitude: -180..180).

### Screen Header (`apps/mobile/src/ui/ScreenHeader.tsx`)

- Search value precedence: explicit `searchValue` prop > `SearchContext` fallback.

### Navigation Structure (`apps/mobile/src/navigation/RootNavigator.tsx`)

- Modal screens (`NotificationsModal`, `ProfileModal`) are declared at the root stack level with `transparentModal` presentation so they overlay the tab navigator.

---

**Last Updated:** March 2026
**Status:** Active Development (65% API coverage)
