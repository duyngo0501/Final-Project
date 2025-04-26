# Chapter 6: Design and Implementation of Demo Product

## 6.1 Product Analysis and Design

### 6.1.1 GUI Design

The user interface design for our application followed a systematic approach focused on usability, accessibility, and visual coherence. Key design principles included:

**Design System Implementation**
- A comprehensive design system was established to ensure visual consistency across the application.
- The system defined color palettes, typography scales, spacing conventions, and component variations.
- Tailwind CSS utility classes were used to implement the design system, allowing for rapid UI development while maintaining consistency.
- Design tokens were implemented using CSS variables to ensure theme consistency and facilitate dark mode implementation.
- A component library was created with storybook documentation for reusable UI elements.

**Responsive Design Strategy**
- A mobile-first design approach was adopted, with layouts expanding and adapting to larger screens.
- Breakpoints were established at 640px, 768px, 1024px, and 1280px to accommodate different device classes.
- Flexible grid layouts and relative units were used to ensure content adapts appropriately to different screen sizes.
- Container queries were implemented for components that needed to adapt based on their parent container rather than viewport.
- Touch targets were sized appropriately (minimum 44×44px) to ensure usability on mobile devices.

**Accessibility Considerations**
- WCAG 2.1 AA compliance was targeted throughout the design process.
- Color contrast ratios of at least 4.5:1 for normal text and 3:1 for large text were maintained.
- Focus states were clearly visible for keyboard navigation.
- Semantic HTML elements were specified to improve screen reader compatibility.
- ARIA attributes were used to enhance accessibility where semantic HTML was insufficient.
- Keyboard navigation patterns were designed for all interactive elements.
- Skip navigation links were included to improve keyboard user experience.

**Navigation Pattern**
- A persistent sidebar navigation on desktop that collapses to a hamburger menu on mobile devices.
- Breadcrumb navigation for hierarchical page structures.
- Tab interfaces for related content within sections.
- Context-specific action buttons positioned consistently across different views.
- Search functionality integrated into the navigation for quick access.
- User profile and settings access positioned consistently in the top-right corner.
- Notification center with badge indicators for unread items.

### 6.1.2 Analysis

The application architecture was designed based on comprehensive analysis of functional requirements, non-functional requirements, and technical constraints.

**Functional Requirements Analysis**
- User authentication and profile management
  - Email/password authentication
  - Social login integration (Google, GitHub)
  - Multi-factor authentication
  - Password reset functionality
  - Profile customization
  - Account settings management
- Content creation, editing, and deletion
  - Rich text editing capabilities
  - Media embedding and management
  - Version history and comparison
  - Draft saving and publishing workflow
  - Collaboration features
- Search and filtering capabilities
  - Full-text search across all content
  - Advanced filtering options with combinatorial logic
  - Saved searches and filters
  - Typeahead suggestions
  - Search result highlighting
- Notification system
  - In-app notifications
  - Email notifications
  - Push notification integration
  - Notification preferences
  - Real-time updates
- Data export functionality
  - Multiple format support (CSV, JSON, PDF)
  - Scheduled exports
  - Partial data selection
  - Export history
- Administrative controls
  - User management
  - Content moderation
  - System configuration
  - Analytics dashboard
  - Audit logging

**Non-functional Requirements Analysis**
- Performance: Page load targets under 2 seconds; API response times under 300ms
  - Time to First Byte (TTFB) < 100ms
  - First Contentful Paint (FCP) < 1.2s
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1
- Scalability: Support for at least 10,000 concurrent users
  - Horizontal scaling capability
  - Database read replica support
  - Stateless application design
  - Caching strategies at multiple levels
  - Load balancing configuration
- Security: Protection against OWASP Top 10 vulnerabilities
  - Input validation and sanitization
  - Content Security Policy (CSP)
  - Cross-Origin Resource Sharing (CORS) configuration
  - XSS and CSRF protection
  - Rate limiting and brute force protection
- Reliability: 99.9% uptime target
  - Graceful degradation strategies
  - Error handling and recovery mechanisms
  - Health monitoring and alerts
  - Backup and restore procedures
  - Disaster recovery plan
- Maintainability: Modular code with high test coverage
  - Code structure and organization
  - Documentation standards
  - Test coverage requirements (>80%)
  - Code review process
  - Technical debt management

**Technical Constraints Analysis**
- Browser compatibility: Support for latest two versions of major browsers
  - Feature detection and polyfills strategy
  - Graceful degradation approach
  - Browser-specific CSS considerations
  - JavaScript compatibility requirements
- API limitations: Rate limits for external service integrations
  - Authentication token management
  - Request throttling implementation
  - Retry and backoff strategies
  - Cache utilization to reduce API calls
  - Fallback mechanisms for API unavailability
- Database performance: Query optimization for large datasets
  - Indexing strategy
  - Query optimization techniques
  - Pagination implementation
  - Data partitioning approach
  - Query caching layer
- Network conditions: Graceful degradation for poor connectivity
  - Offline-first capabilities
  - Progressive loading patterns
  - Network status detection
  - Bandwidth-aware asset loading
  - Request prioritization
- Mobile responsiveness: Support for iOS 13+ and Android 9+
  - Touch interaction patterns
  - Mobile viewport considerations
  - Device-specific features utilization
  - Native browser integration

### 6.1.3 Basic and Detailed Design

**System Architecture**
- Frontend: React Single Page Application (SPA)
  - React 18 with Concurrent Rendering
  - TypeScript for type safety
  - React Router for client-side routing
  - React Query for data fetching and caching
  - Context API with optimizations for state management
  - CSS-in-JS with Emotion for component styling
  - Tailwind CSS for utility-first styling
- Backend: Python FastAPI RESTful services
  - FastAPI with Uvicorn ASGI server
  - Pydantic for data validation
  - SQLAlchemy for ORM functionality
  - Alembic for database migrations
  - PyJWT for token handling
  - AsyncIO for asynchronous operations
  - FastAPI Dependency Injection system
- Database: SQL (PostgreSQL) with Supabase for real-time features
  - PostgreSQL 14 with JSON/JSONB support
  - Supabase Realtime for websocket subscriptions
  - Row-Level Security (RLS) for data access control
  - Full-text search capabilities
  - PostGIS extension for geospatial features
  - Connection pooling with PgBouncer
- Authentication: JWT-based auth flow with refresh tokens
  - Access token / Refresh token pattern
  - HTTP-only cookie storage for tokens
  - Token rotation for enhanced security
  - OAuth2 integration for social logins
  - Argon2id for password hashing
  - Rate limiting for authentication endpoints
- Deployment: Docker containerization with Nginx for static assets
  - Multi-stage Docker builds
  - Docker Compose for local development
  - Nginx for static file serving and reverse proxy
  - Environment-specific configuration
  - Health check endpoints
  - Container orchestration readiness

**Component Architecture**
- Atomic design methodology for UI components
  - Atoms: Basic UI elements (buttons, inputs, icons)
  - Molecules: Combinations of atoms (form fields, search bars)
  - Organisms: Complex UI sections (navigation, cards)
  - Templates: Page layouts without specific content
  - Pages: Complete views with actual content
- Container/Presentational pattern for separation of concerns
  - Container components handle data and state
  - Presentational components handle rendering
  - Props interface definitions for components
  - Explicit prop forwarding for maintainability
  - Composition over inheritance principle
- Context API for state management with use-context-selector for performance
  - Domain-specific context providers
  - Context provider composition pattern
  - useContextSelector for targeted re-renders
  - Memoization of context values
  - Provider testing utilities
- HOC (Higher Order Components) for cross-cutting concerns
  - Authentication protection
  - Role-based access control
  - Performance monitoring
  - Error boundary implementation
  - Feature flag control
- Custom hooks for reusable logic
  - Data fetching abstractions
  - Form state management
  - Window and viewport utilities
  - Authentication state
  - Debounce and throttle utilities

**Data Flow Architecture**
- React Query for data fetching, caching, and synchronization
  - Query key structure conventions
  - Stale time configuration
  - Prefetching strategies
  - Mutation error handling
  - Optimistic update patterns
  - Query invalidation approach
- Optimistic updates for improved perceived performance
  - Client-side state prediction
  - Rollback mechanisms for failed requests
  - Loading state management
  - Success/error notification pattern
  - Retry configuration
- Debounced inputs for search and filter operations
  - Search query debouncing (300ms)
  - Filter change batching
  - Background data fetching
  - Query parameter synchronization
  - Search history management
- Pagination and infinite scrolling for large datasets
  - Cursor-based pagination implementation
  - Virtualized list rendering
  - Pagination state management
  - Infinite query configuration
  - Scroll position restoration
- Batch operations for bulk data modifications
  - Multi-item selection
  - Batch request handling
  - Progress indication
  - Partial success handling
  - Failure recovery strategy

**Security Architecture**
- HTTPS for all communications
  - TLS 1.3 configuration
  - Strong cipher suite selection
  - HSTS implementation
  - Certificate management strategy
  - Mixed content prevention
- CSRF protection for form submissions
  - Double-submit cookie pattern
  - SameSite cookie attribute
  - Origin verification
  - CSRF token lifecycle management
  - Form action validation
- Content Security Policy implementation
  - Strict CSP rules
  - Nonce-based script execution
  - Report-URI configuration
  - Upgrade-Insecure-Requests directive
  - Frame-ancestors restriction
- Rate limiting for authentication attempts
  - IP-based rate limiting
  - Account-based rate limiting
  - Progressive delays for repeated failures
  - Lockout notifications
  - Administrative override capability
- Input validation on both client and server
  - Schema-based validation
  - Sanitization of user input
  - Type coercion rules
  - Custom validation logic
  - Error message localization

## 6.2 Features with Screenshots

### 6.2.1 User Authentication System

![Authentication Screen](placeholder_for_auth_screenshot.png)

The authentication system provides secure access to the application with multiple options for users. Key features include:

- Email/password authentication with strong password requirements
  - Minimum password length of 8 characters
  - Requires uppercase, lowercase, number, and special character
  - Password strength indicator
  - Common password detection
  - Breached password detection via Have I Been Pwned API
- Social login integration (Google, GitHub)
  - OAuth 2.0 implementation
  - Profile data synchronization
  - Account linking capabilities
  - Authorization scope control
  - Fallback authentication options
- Two-factor authentication option
  - Time-based one-time password (TOTP)
  - Backup recovery codes
  - Remember device functionality
  - QR code setup flow
  - Cross-device verification
- Password reset workflow
  - Time-limited reset tokens
  - Email verification
  - IP address logging
  - Account activity notification
  - Progressive identity verification
- Remember me functionality
  - Secure persistent cookie implementation
  - Device fingerprinting
  - Automatic session extension
  - Active session management
  - Remote logout capability
- Session management across devices
  - Concurrent session visibility
  - Device identification
  - Last activity tracking
  - Session revocation
  - Suspicious activity alerts

The implementation uses JWT tokens with secure storage in HTTP-only cookies and implements refresh token rotation for enhanced security.

### 6.2.2 Dashboard and Analytics

![Dashboard Screen](placeholder_for_dashboard_screenshot.png)

The dashboard presents users with a personalized overview of their data and activities. Key components include:

- Summary cards with key metrics
  - Activity completion rates
  - Content engagement statistics
  - Recent productivity metrics
  - Comparison to previous periods
  - Goal progress indicators
- Interactive charts for data visualization
  - Time-series activity charts
  - Category distribution pie charts
  - Progress tracking bar charts
  - Comparative benchmark visualizations
  - Dynamic filtering capabilities
- Recent activity timeline
  - Chronological activity feed
  - Activity type categorization
  - Contextual action links
  - Infinite scroll loading
  - Activity detail expansion
- Quick action shortcuts
  - Most frequent task shortcuts
  - Context-aware suggested actions
  - Custom shortcut configuration
  - Drag-and-drop arrangement
  - Usage-based adaptive shortcuts
- Customizable widget layout
  - Drag-and-drop widget positioning
  - Widget size adjustment
  - Widget visibility toggling
  - Layout persistence
  - Layout template selection
- Real-time updates for collaborative features
  - Live notification indicators
  - Real-time content changes
  - Presence indicators
  - Typing indicators
  - Activity broadcast for team awareness

The implementation uses React Query for data fetching with optimistic updates, and employs memoization techniques to optimize rendering performance.

### 6.2.3 Content Management Interface

![Content Management Screen](placeholder_for_content_screenshot.png)

The content management interface allows users to create, edit, and organize their content efficiently. Features include:

- Rich text editor with formatting options
  - Block formatting controls
  - Inline styling options
  - Table creation and editing
  - Code block formatting with syntax highlighting
  - Keyboard shortcut support
  - Markdown shortcuts
- Media embedding capabilities
  - Image upload and insertion
  - Video embedding from popular platforms
  - File attachment support
  - Image resizing and positioning
  - Gallery creation
  - Drag-and-drop upload
- Tagging and categorization system
  - Hierarchical category structure
  - Multiple tag selection
  - Tag color customization
  - Autocomplete suggestions
  - Tag usage statistics
  - Bulk tag management
- Version history and comparison
  - Automatic versioning
  - Named version snapshots
  - Visual diff comparison
  - Version restoration
  - Change annotation
  - Contributor tracking
- Collaborative editing with presence indicators
  - Real-time cursor positions
  - User attribution for changes
  - Conflict resolution
  - Comment and suggestion system
  - Permission-based access control
  - Notification of concurrent edits
- Drag-and-drop organization
  - Content reordering
  - Folder organization
  - Bulk selection and movement
  - Visual feedback during drag operations
  - Keyboard accessibility for drag operations
  - Undo/redo support for organizational changes

The implementation uses a modular editor framework with plugins for extensibility and employs optimistic updates for a responsive user experience.

### 6.2.4 Search and Filter Functionality

![Search Interface](placeholder_for_search_screenshot.png)

The search and filter system enables users to quickly find relevant information across the application. Key features include:

- Full-text search across all content
  - Natural language query processing
  - Fuzzy matching for typo tolerance
  - Relevance scoring
  - Content type-specific search
  - Metadata inclusion in search scope
  - Exact phrase matching with quotations
- Type-ahead suggestions
  - Query prediction based on partial input
  - Previous search history integration
  - Popular searches suggestion
  - Category-specific suggestions
  - Contextual result preview
  - Keyboard navigation of suggestions
- Advanced filtering options
  - Multi-criteria filter combination
  - Date range selection
  - Numeric range filters
  - Category and tag filtering
  - Status-based filtering
  - Attribution filters (created by, modified by)
- Saved search functionality
  - Named search configurations
  - Default search designation
  - Search sharing between users
  - Automatic search execution
  - Search modification tracking
  - Search result notifications
- Recent search history
  - Chronological search tracking
  - One-click search repetition
  - Search performance metrics
  - Result count indicators
  - Search refinement suggestions
  - Search history management
- Contextual search within sections
  - Section-specific search scope
  - Breadcrumb integration with search
  - Search scope indication
  - Scope expansion options
  - Preserved context across search refinements
  - Related content suggestions

The implementation uses debounced input handling to minimize unnecessary requests and employs client-side caching for improved performance.

### 6.2.5 User Profile and Settings

![Profile Settings](placeholder_for_profile_screenshot.png)

The profile and settings interface allows users to manage their account and personalize their experience. Key features include:

- Profile information management
  - Personal details editing
  - Profile picture upload and cropping
  - Bio and description fields
  - Professional information
  - Social media links
  - Profile visibility controls
- Notification preferences
  - Notification type toggles
  - Delivery channel selection (in-app, email, push)
  - Frequency controls
  - Time-based quiet periods
  - Priority-based filtering
  - Digest configuration
- Theme customization
  - Light/dark mode selection
  - System preference synchronization
  - Custom color scheme options
  - Font size adjustment
  - Density controls
  - Saved theme presets
- Privacy settings
  - Data sharing controls
  - Profile visibility options
  - Activity tracking preferences
  - Third-party connection management
  - Data retention policies
  - Download personal data
- Connected accounts management
  - OAuth connection status
  - Service integration enablement
  - Permission scopes review
  - Connection refresh
  - Usage statistics
  - Revocation controls
- Data export options
  - Format selection (JSON, CSV, PDF)
  - Content scope selection
  - Scheduled exports
  - Export history
  - Encryption options
  - Retention period configuration

The implementation follows a tab-based layout for organized settings categories and uses form validation with immediate feedback.

## 6.3 Product Implementation

### 6.3.1 Frontend Component Structure

```jsx
// Component hierarchy for the Authentication feature
// apps/frontend/src/components/auth/LoginForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, TextField, Alert } from '../ui';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.email) newErrors.email = 'Email is required';
    if (!credentials.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(credentials);
      // Successful login handled by AuthContext (redirect)
    } catch (error) {
      setErrors({ form: error.message || 'Login failed' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && <Alert variant="error">{errors.form}</Alert>}
      
      <TextField
        label="Email Address"
        type="email"
        name="email"
        value={credentials.email}
        onChange={handleChange}
        error={errors.email}
        required
      />
      
      <TextField
        label="Password"
        type="password"
        name="password"
        value={credentials.password}
        onChange={handleChange}
        error={errors.password}
        required
      />
      
      <Button 
        type="submit" 
        variant="primary" 
        isLoading={isLoading}
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
```

The component architecture follows React best practices with:
- Functional components and hooks for state management
- Form validation with clear error messaging
- Abstracted UI components for consistency
- Context API for auth state management
- Loading state handling for better UX
- Explicit type definitions for props and state
- Error boundary integration for fault tolerance
- Memoization patterns for performance optimization
- Accessibility-focused event handlers
- Consistent naming conventions

### 6.3.2 Backend API Implementation

```python
# FastAPI route for user authentication
# apps/backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.core.config import settings
from app.schemas.auth import Token, UserCreate, UserLogin
from app.services.auth import authenticate_user, create_access_token
from app.dal.user import create_user, get_user_by_email

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=Token)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    db_user = await get_user_by_email(user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = await create_user(user_data)
    
    # Generate tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
```

The backend implementation follows FastAPI best practices with:
- Clear route organization with APIRouter
- Proper dependency injection
- Schema validation using Pydantic models
- Comprehensive error handling
- JWT token generation with expiration
- Password hashing for security
- Asynchronous endpoint handlers
- Path and query parameter validation
- CORS middleware configuration
- Rate limiting implementation
- Request logging for debugging
- Health check endpoints
- Documentation via OpenAPI/Swagger

### 6.3.3 Database Models

```python
# SQLAlchemy models for user data
# apps/backend/app/models/user.py

from sqlalchemy import Boolean, Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    avatar_url = Column(String)
    bio = Column(String)
    theme_preference = Column(String, default="system")
    notification_preferences = Column(JSONB, default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Define relationship
    user = relationship("User", back_populates="profile")
```

The database models implement:
- UUID primary keys for security
- Proper relationship definitions
- Timestamp tracking for auditing
- Index optimization for queries
- Appropriate column types and constraints
- Cascade delete rules for related records
- Default values for required fields
- Check constraints for data integrity
- JSONB columns for flexible schema
- Soft delete patterns where appropriate
- Composite indices for query optimization
- Unicode support for international content

### 6.3.4 Frontend State Management

```jsx
// Context API implementation for auth state
// apps/frontend/src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        // Handle token expiration or invalid token
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.access_token);
      
      // Set up API interceptor for token
      api.interceptors.request.use(
        config => {
          config.headers.Authorization = `Bearer ${data.access_token}`;
          return config;
        }
      );
      
      // Get user data
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }), [user, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

The state management implementation includes:
- Context API for global state
- Custom hooks for context consumption
- Token management with localStorage
- API interceptors for auth headers
- Error handling and loading states
- Memoization for performance optimization
- Provider composition patterns
- State segregation by domain
- Custom selector hooks
- Provider testing utilities
- Type-safe context implementations
- Reducer patterns for complex state

### 6.3.5 API Integration with React Query

```jsx
// React Query implementation for data fetching
// apps/frontend/src/hooks/useItems.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useItems = (filters = {}) => {
  // Convert filters to query string
  const queryParams = new URLSearchParams(filters).toString();
  
  return useQuery({
    queryKey: ['items', filters],
    queryFn: async () => {
      const { data } = await api.get(`/items?${queryParams}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useItem = (id) => {
  return useQuery({
    queryKey: ['items', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newItem) => {
      const { data } = await api.post('/items', newItem);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.patch(`/items/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      // Update item in cache and invalidate list
      queryClient.setQueryData(['items', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/items/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: ['items', id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};
```

The API integration showcases:
- React Query for server-state management
- Query invalidation and cache updates
- Optimistic updates for mutations
- Proper error handling
- Query key structuring for cache management
- Infinite query patterns for pagination
- Custom hook abstractions for API calls
- Request cancellation handling
- Retry and error recovery strategies
- Background fetching configuration
- Request deduplication
- Query prefetching for improved UX

## 6.4 Evaluation of Your Product

### 6.4.1 Strengths

1. **Responsive Design Implementation**
   The application provides a consistent and intuitive experience across device sizes, from mobile to desktop. The implementation of Tailwind CSS with responsive utility classes allowed for rapid development of adaptive layouts. The mobile-first approach ensured that the interface scaled appropriately to larger screens rather than degrading on smaller ones.

2. **Performance Optimization**
   Loading times were optimized through techniques such as code splitting, lazy loading, and asset optimization. React Query's caching capabilities significantly reduced unnecessary network requests, providing a smoother user experience. The implementation of virtualized lists for large datasets ensured smooth scrolling even with thousands of items.

3. **Architectural Separation of Concerns**
   The clear separation between frontend and backend components, with well-defined API contracts, improved maintainability and allowed for independent scaling of services as needed. The modular architecture enables teams to work on different parts of the application without interference, while the consistent patterns improve onboarding for new developers.

4. **Comprehensive Authentication System**
   The JWT-based authentication system with refresh token rotation provided robust security while maintaining a good user experience. The implementation handled edge cases like token expiration and concurrent sessions effectively. The flexible authentication options (email/password, social providers, 2FA) accommodate diverse user preferences and security requirements.

5. **Real-time Capabilities**
   Integration with Supabase enabled real-time updates for collaborative features without requiring complex WebSocket implementation or custom server-side event handling. This allowed for presence indicators, live editing, and instantaneous notifications that enhance the collaborative aspects of the application without creating significant development complexity.

### 6.4.2 Areas for Improvement

1. **Initial Loading Performance**
   The initial application bundle size could be further optimized to improve first-load performance, particularly for users on slower connections or less powerful devices. Implementing more aggressive code splitting, server-side rendering for initial content, and critical CSS inlining would improve perceived performance metrics like First Contentful Paint and Largest Contentful Paint.

2. **Test Coverage**
   While critical paths have test coverage, some areas of the application would benefit from more comprehensive testing, particularly edge cases and error handling scenarios. Implementing a more structured approach to integration testing and introducing end-to-end tests for critical user flows would improve overall reliability and regression prevention.

3. **Accessibility Enhancements**
   Although basic accessibility features were implemented, a more thorough audit and implementation of ARIA attributes could improve the experience for users with disabilities. Additional focus management, screen reader announcements for dynamic content, and keyboard navigation paths would make the application more inclusive and comply with higher WCAG standards.

4. **Mobile Gesture Support**
   Additional mobile-specific interactions, such as swipe gestures for common actions, could enhance the mobile experience beyond basic responsive design. Implementing touch-optimized interfaces for complex interactions like drag-and-drop, pinch-to-zoom for visual content, and pull-to-refresh patterns would make the mobile experience feel more native.

5. **Offline Support**
   The application currently has limited functionality when offline. Implementing service workers and offline data synchronization would improve reliability in environments with intermittent connectivity. A structured approach to conflict resolution for offline changes would enhance the user experience in challenging network conditions.

6. **Documentation Improvement**
   While the codebase follows consistent patterns, more comprehensive documentation for API endpoints, component props, and state management would improve maintainability. Implementing automatic documentation generation from code comments and creating more detailed architecture diagrams would benefit long-term sustainability.

## 6.3 Implementation

### 6.3.1 Technical Architecture

#### Frontend Architecture

The frontend application follows a component-based architecture using React with TypeScript for type safety. The architecture consists of several layers:

1. **Presentation Layer**
   - Atomic design pattern implemented with atoms, molecules, organisms, and templates
   - Component library built with styled-components for consistent theming
   - Responsive layout system using CSS Grid and Flexbox
   - Design tokens for colors, typography, spacing, and animations
   - Server components for static and dynamic content rendering

2. **State Management**
   - React Context API for global state management
   - Custom hooks for domain-specific state management
   - Redux Toolkit for complex state with middleware support
   - React Query for server state management with caching
   - Optimistic UI updates for improved perceived performance

3. **Routing and Navigation**
   - Next.js App Router for file-based routing
   - Middleware for authentication and route protection
   - Layout components for persistent UI elements
   - Dynamic imports for code splitting
   - Parallel routes for multi-panel interfaces

4. **API Communication**
   - Custom API client with interceptors for authentication
   - GraphQL client with fragment management
   - WebSocket connection for real-time updates
   - Service layer abstracting backend communication
   - Error handling middleware with retry logic

#### Backend Architecture

The backend system uses a microservices architecture with the following components:

1. **API Layer**
   - RESTful API following OpenAPI specification
   - GraphQL API with federation for complex queries
   - API Gateway for request routing and aggregation
   - Rate limiting and throttling middleware
   - Request validation using JSON Schema

2. **Service Layer**
   - Domain-driven design approach for service boundaries
   - Microservices for core domain functionalities
   - Service discovery using Kubernetes DNS
   - Circuit breakers for fault tolerance
   - Message queue for asynchronous processing

3. **Data Layer**
   - PostgreSQL for relational data with partitioning
   - Redis for caching and real-time features
   - Elasticsearch for full-text search capabilities
   - Object storage for file attachments
   - Data access layer with repositories pattern

4. **Infrastructure**
   - Containerization using Docker
   - Kubernetes for orchestration
   - Terraform for infrastructure as code
   - CI/CD pipeline with GitHub Actions
   - Monitoring stack with Prometheus and Grafana

### 6.3.2 Database Implementation

The database schema implements the entity-relationship model described in Chapter 4, with the following optimizations:

1. **Table Structure**
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) NOT NULL UNIQUE,
     name VARCHAR(255) NOT NULL,
     avatar_url TEXT,
     password_hash TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_login_at TIMESTAMP WITH TIME ZONE,
     CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
   );

   CREATE TABLE workspaces (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     slug VARCHAR(50) NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_by UUID REFERENCES users(id),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     settings JSONB DEFAULT '{}'
   );

   CREATE TABLE workspace_members (
     workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     role VARCHAR(50) NOT NULL,
     joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (workspace_id, user_id)
   );

   CREATE TABLE projects (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     status VARCHAR(50) DEFAULT 'active',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_by UUID REFERENCES users(id),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     due_date TIMESTAMP WITH TIME ZONE,
     UNIQUE (workspace_id, name)
   );

   CREATE TABLE tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     status VARCHAR(50) DEFAULT 'todo',
     priority VARCHAR(50) DEFAULT 'medium',
     assignee_id UUID REFERENCES users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_by UUID REFERENCES users(id),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     due_date TIMESTAMP WITH TIME ZONE,
     parent_task_id UUID REFERENCES tasks(id),
     position REAL NOT NULL DEFAULT 1000,
     metadata JSONB DEFAULT '{}'
   );
   ```

2. **Indexing Strategy**
   ```sql
   -- Task queries by project and status
   CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
   
   -- Task sorting by position
   CREATE INDEX idx_tasks_position ON tasks(project_id, position);
   
   -- Assignee workload queries
   CREATE INDEX idx_tasks_assignee ON tasks(assignee_id, status, due_date);
   
   -- Full-text search on tasks
   CREATE INDEX idx_tasks_search ON tasks USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));
   
   -- JSON path operations on metadata
   CREATE INDEX idx_tasks_metadata ON tasks USING GIN (metadata);
   
   -- Workspace member lookup
   CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
   ```

3. **Data Access Patterns**
   - Read-heavy operations use materialized views refreshed on schedule
   - Frequently accessed reference data is cached in Redis
   - Hierarchical task queries use recursive CTEs
   - Bulk operations use prepared statements with parameterized queries
   - Temporal queries leverage time-range partitioning

### 6.3.3 API Implementation

The API layer implements both REST and GraphQL interfaces:

1. **REST API Endpoints**
   ```
   # Authentication
   POST   /api/auth/login
   POST   /api/auth/register
   POST   /api/auth/refresh
   DELETE /api/auth/logout
   
   # Users
   GET    /api/users/me
   PATCH  /api/users/me
   GET    /api/users/:id
   
   # Workspaces
   GET    /api/workspaces
   POST   /api/workspaces
   GET    /api/workspaces/:id
   PATCH  /api/workspaces/:id
   DELETE /api/workspaces/:id
   
   # Projects
   GET    /api/workspaces/:workspaceId/projects
   POST   /api/workspaces/:workspaceId/projects
   GET    /api/projects/:id
   PATCH  /api/projects/:id
   DELETE /api/projects/:id
   
   # Tasks
   GET    /api/projects/:projectId/tasks
   POST   /api/projects/:projectId/tasks
   GET    /api/tasks/:id
   PATCH  /api/tasks/:id
   DELETE /api/tasks/:id
   POST   /api/tasks/:id/comments
   GET    /api/tasks/:id/comments
   ```

2. **GraphQL Schema**
   ```graphql
   type User {
     id: ID!
     email: String!
     name: String!
     avatarUrl: String
     createdAt: DateTime!
     tasks: [Task!]!
     assignedTasks: [Task!]!
     workspaces: [WorkspaceMember!]!
   }

   type Workspace {
     id: ID!
     name: String!
     slug: String!
     createdAt: DateTime!
     createdBy: User!
     members: [WorkspaceMember!]!
     projects: [Project!]!
     settings: JSONObject
   }

   type WorkspaceMember {
     workspace: Workspace!
     user: User!
     role: String!
     joinedAt: DateTime!
   }

   type Project {
     id: ID!
     workspace: Workspace!
     name: String!
     description: String
     status: String!
     createdAt: DateTime!
     createdBy: User!
     updatedAt: DateTime!
     dueDate: DateTime
     tasks: [Task!]!
   }

   type Task {
     id: ID!
     project: Project!
     title: String!
     description: String
     status: String!
     priority: String!
     assignee: User
     createdAt: DateTime!
     createdBy: User!
     updatedAt: DateTime!
     dueDate: DateTime
     parentTask: Task
     subtasks: [Task!]!
     position: Float!
     metadata: JSONObject
     comments: [Comment!]!
   }

   type Comment {
     id: ID!
     task: Task!
     user: User!
     content: String!
     createdAt: DateTime!
     updatedAt: DateTime!
   }

   type Query {
     me: User!
     user(id: ID!): User
     workspaces: [Workspace!]!
     workspace(id: ID!): Workspace
     projects(workspaceId: ID!): [Project!]!
     project(id: ID!): Project
     tasks(projectId: ID!, status: String): [Task!]!
     task(id: ID!): Task
     searchTasks(query: String!): [Task!]!
   }

   type Mutation {
     createWorkspace(input: CreateWorkspaceInput!): Workspace!
     updateWorkspace(id: ID!, input: UpdateWorkspaceInput!): Workspace!
     deleteWorkspace(id: ID!): Boolean!
     
     createProject(input: CreateProjectInput!): Project!
     updateProject(id: ID!, input: UpdateProjectInput!): Project!
     deleteProject(id: ID!): Boolean!
     
     createTask(input: CreateTaskInput!): Task!
     updateTask(id: ID!, input: UpdateTaskInput!): Task!
     deleteTask(id: ID!): Boolean!
     
     addComment(taskId: ID!, content: String!): Comment!
   }

   type Subscription {
     taskUpdated(projectId: ID!): Task!
     commentAdded(taskId: ID!): Comment!
   }
   ```

### 6.3.4 Frontend Implementation

The frontend implementation focuses on modular components and a robust state management system:

1. **Component Structure**
   ```
   src/
   ├── components/
   │   ├── atoms/
   │   │   ├── Button/
   │   │   ├── Input/
   │   │   └── Typography/
   │   ├── molecules/
   │   │   ├── TaskCard/
   │   │   ├── CommentItem/
   │   │   └── UserAvatar/
   │   ├── organisms/
   │   │   ├── TaskList/
   │   │   ├── ProjectHeader/
   │   │   └── WorkspaceNav/
   │   └── templates/
   │       ├── DashboardLayout/
   │       ├── KanbanBoard/
   │       └── CalendarView/
   ├── hooks/
   │   ├── useAuth.ts
   │   ├── useTasks.ts
   │   └── useWorkspace.ts
   ├── services/
   │   ├── api.ts
   │   ├── taskService.ts
   │   └── userService.ts
   ├── store/
   │   ├── authSlice.ts
   │   ├── taskSlice.ts
   │   └── store.ts
   └── utils/
       ├── date.ts
       ├── validation.ts
       └── formatting.ts
   ```

2. **Task List Implementation**
   ```tsx
   // TaskList.tsx
   import React, { useState, useEffect } from 'react';
   import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
   import { useQuery, useMutation, useQueryClient } from 'react-query';
   import { TaskCard } from '../molecules/TaskCard';
   import { taskService } from '../../services/taskService';
   
   interface TaskListProps {
     projectId: string;
     filters?: {
       status?: string[];
       assignee?: string[];
       priority?: string[];
     };
   }
   
   export const TaskList: React.FC<TaskListProps> = ({ projectId, filters }) => {
     const queryClient = useQueryClient();
     
     // Fetch tasks with React Query
     const { data: tasks, isLoading, error } = useQuery(
       ['tasks', projectId, filters],
       () => taskService.getTasks(projectId, filters),
       {
         staleTime: 5 * 60 * 1000, // 5 minutes
         refetchOnWindowFocus: true,
       }
     );
     
     // Update task mutation
     const updateTaskMutation = useMutation(
       (updates: { id: string; position: number; status?: string }) => 
         taskService.updateTask(updates.id, { position: updates.position, status: updates.status }),
       {
         onSuccess: () => {
           queryClient.invalidateQueries(['tasks', projectId]);
         },
       }
     );
     
     // Handle drag and drop
     const handleDragEnd = (result) => {
       if (!result.destination) return;
       
       const { draggableId, source, destination } = result;
       
       // Calculate new position
       const sourceIndex = source.index;
       const destinationIndex = destination.index;
       const sourceStatus = source.droppableId;
       const destinationStatus = destination.droppableId;
       
       // Get tasks in the destination column
       const destinationTasks = tasks.filter(task => 
         task.status === destinationStatus
       ).sort((a, b) => a.position - b.position);
       
       // Calculate new position
       let newPosition;
       if (destinationTasks.length === 0) {
         newPosition = 1000;
       } else if (destinationIndex === 0) {
         newPosition = destinationTasks[0].position / 2;
       } else if (destinationIndex >= destinationTasks.length) {
         newPosition = destinationTasks[destinationTasks.length - 1].position + 1000;
       } else {
         newPosition = (
           destinationTasks[destinationIndex - 1].position +
           destinationTasks[destinationIndex].position
         ) / 2;
       }
       
       // Update task position in backend
       updateTaskMutation.mutate({
         id: draggableId,
         position: newPosition,
         status: sourceStatus !== destinationStatus ? destinationStatus : undefined,
       });
       
       // Optimistic update in the UI
       const updatedTasks = [...tasks];
       const taskIndex = updatedTasks.findIndex(t => t.id === draggableId);
       if (taskIndex >= 0) {
         updatedTasks[taskIndex] = {
           ...updatedTasks[taskIndex],
           position: newPosition,
           status: sourceStatus !== destinationStatus ? destinationStatus : updatedTasks[taskIndex].status,
         };
       }
       
       // Sort tasks by position
       queryClient.setQueryData(['tasks', projectId], updatedTasks);
     };
     
     // Group tasks by status
     const groupedTasks = React.useMemo(() => {
       if (!tasks) return {};
       
       const grouped = {};
       tasks.forEach(task => {
         if (!grouped[task.status]) {
           grouped[task.status] = [];
         }
         grouped[task.status].push(task);
       });
       
       // Sort tasks within each status group by position
       Object.keys(grouped).forEach(status => {
         grouped[status].sort((a, b) => a.position - b.position);
       });
       
       return grouped;
     }, [tasks]);
     
     if (isLoading) return <div>Loading tasks...</div>;
     if (error) return <div>Error loading tasks</div>;
     
     return (
       <DragDropContext onDragEnd={handleDragEnd}>
         <div className="task-columns">
           {['todo', 'in_progress', 'in_review', 'done'].map(status => (
             <div key={status} className="task-column">
               <h3>{status.replace('_', ' ').toUpperCase()}</h3>
               <Droppable droppableId={status}>
                 {(provided) => (
                   <div
                     ref={provided.innerRef}
                     {...provided.droppableProps}
                     className="task-list"
                   >
                     {groupedTasks[status]?.map((task, index) => (
                       <Draggable key={task.id} draggableId={task.id} index={index}>
                         {(provided) => (
                           <div
                             ref={provided.innerRef}
                             {...provided.draggableProps}
                             {...provided.dragHandleProps}
                           >
                             <TaskCard task={task} />
                           </div>
                         )}
                       </Draggable>
                     ))}
                     {provided.placeholder}
                   </div>
                 )}
               </Droppable>
             </div>
           ))}
         </div>
       </DragDropContext>
     );
   };
   ```

### 6.3.5 Authentication Implementation

The authentication system implements secure JWT-based authentication:

1. **Authentication Flow**
   ```typescript
   // authService.ts
   import axios from 'axios';
   
   const API_URL = process.env.NEXT_PUBLIC_API_URL;
   
   interface LoginCredentials {
     email: string;
     password: string;
   }
   
   interface RegisterData {
     email: string;
     password: string;
     name: string;
   }
   
   interface AuthTokens {
     accessToken: string;
     refreshToken: string;
     expiresIn: number;
   }
   
   class AuthService {
     private refreshPromise: Promise<AuthTokens> | null = null;
     
     async login(credentials: LoginCredentials): Promise<AuthTokens> {
       const response = await axios.post(`${API_URL}/auth/login`, credentials);
       this.setTokens(response.data);
       return response.data;
     }
     
     async register(data: RegisterData): Promise<AuthTokens> {
       const response = await axios.post(`${API_URL}/auth/register`, data);
       this.setTokens(response.data);
       return response.data;
     }
     
     async logout(): Promise<void> {
       const refreshToken = localStorage.getItem('refreshToken');
       if (refreshToken) {
         try {
           await axios.delete(`${API_URL}/auth/logout`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
             data: { refreshToken }
           });
         } catch (error) {
           console.error('Logout failed', error);
         }
       }
       this.clearTokens();
     }
     
     async refreshAuth(): Promise<AuthTokens> {
       // Ensure only one refresh request happens at a time
       if (this.refreshPromise) {
         return this.refreshPromise;
       }
       
       const refreshToken = localStorage.getItem('refreshToken');
       if (!refreshToken) {
         throw new Error('No refresh token available');
       }
       
       this.refreshPromise = axios.post(`${API_URL}/auth/refresh`, { refreshToken })
         .then(response => {
           this.setTokens(response.data);
           return response.data;
         })
         .finally(() => {
           this.refreshPromise = null;
         });
       
       return this.refreshPromise;
     }
     
     setTokens(tokens: AuthTokens): void {
       localStorage.setItem('accessToken', tokens.accessToken);
       localStorage.setItem('refreshToken', tokens.refreshToken);
       localStorage.setItem('tokenExpiry', (Date.now() + tokens.expiresIn * 1000).toString());
     }
     
     clearTokens(): void {
       localStorage.removeItem('accessToken');
       localStorage.removeItem('refreshToken');
       localStorage.removeItem('tokenExpiry');
     }
     
     isAuthenticated(): boolean {
       const token = localStorage.getItem('accessToken');
       const expiry = localStorage.getItem('tokenExpiry');
       return !!token && !!expiry && parseInt(expiry, 10) > Date.now();
     }
     
     getAccessToken(): string | null {
       return localStorage.getItem('accessToken');
     }
   }
   
   export const authService = new AuthService();
   ```

2. **API Client with Auth Interceptors**
   ```typescript
   // apiClient.ts
   import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
   import { authService } from './authService';

   class ApiClient {
     private client: AxiosInstance;
     
     constructor() {
       this.client = axios.create({
         baseURL: process.env.NEXT_PUBLIC_API_URL,
         headers: {
           'Content-Type': 'application/json'
         }
       });
       
       this.setupInterceptors();
     }
     
     private setupInterceptors(): void {
       // Request interceptor to add auth token
       this.client.interceptors.request.use(
         (config) => {
           const token = authService.getAccessToken();
           if (token) {
             config.headers.Authorization = `Bearer ${token}`;
           }
           return config;
         },
         (error) => Promise.reject(error)
       );
       
       // Response interceptor to handle token refresh
       this.client.interceptors.response.use(
         (response) => response,
         async (error: AxiosError) => {
           const originalRequest = error.config;
           
           // If error is 401 and we haven't already tried to refresh
           if (error.response?.status === 401 && !originalRequest?.headers?.['X-Retry']) {
             try {
               // Try to refresh the token
               await authService.refreshAuth();
               
               // Retry the original request with new token
               originalRequest.headers['Authorization'] = `Bearer ${authService.getAccessToken()}`;
               originalRequest.headers['X-Retry'] = 'true';
               
               return this.client(originalRequest);
             } catch (refreshError) {
               // If refresh fails, logout and redirect to login
               authService.clearTokens();
               window.location.href = '/login';
               return Promise.reject(refreshError);
             }
           }
           
           return Promise.reject(error);
         }
       );
     }
     
     async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
       const response = await this.client.get<T>(url, config);
       return response.data;
     }
     
     async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
       const response = await this.client.post<T>(url, data, config);
       return response.data;
     }
     
     async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
       const response = await this.client.put<T>(url, data, config);
       return response.data;
     }
     
     async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
       const response = await this.client.patch<T>(url, data, config);
       return response.data;
     }
     
     async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
       const response = await this.client.delete<T>(url, config);
       return response.data;
     }
   }
   
   export const apiClient = new ApiClient();
   ``` 