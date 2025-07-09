# ⚡ **Greact-Bones Best Practices Guide**

> **Recommended patterns, conventions, and techniques for building scalable applications**

This guide provides battle-tested best practices for developing with the Greact-Bones stack. Follow these patterns to build maintainable, scalable, and robust applications.

## 📋 **Table of Contents**

- [Backend Best Practices](#-backend-best-practices)
- [Frontend Best Practices](#-frontend-best-practices)
- [API Design Guidelines](#-api-design-guidelines)
- [State Management Patterns](#-state-management-patterns)
- [Error Handling Strategies](#-error-handling-strategies)
- [Performance Optimization](#-performance-optimization)
- [Security Best Practices](#-security-best-practices)
- [Testing Guidelines](#-testing-guidelines)

---

## 🔧 **Backend Best Practices**

### **Project Structure & Organization**

#### **✅ DO: Follow Standard Go Project Layout**
```
backend/
├── cmd/
│   └── api/main.go          # Application entry point
├── internal/                # Private application code
│   ├── api/                # HTTP handlers and middleware
│   ├── domain/             # Core business logic
│   ├── data/               # Database access layer
│   └── config/             # Configuration management
├── pkg/                    # Public, reusable packages
├── scripts/                # Build and deployment scripts
└── docs/                   # API documentation
```

#### **❌ DON'T: Mix concerns in handlers**
```go
// Bad: Business logic in handler
func getUserHandler(c *gin.Context) {
    // Database logic directly in handler
    var user User
    db.Where("id = ?", c.Param("id")).First(&user)
    
    // Business logic in handler
    if user.IsActive && user.LastLogin.After(time.Now().AddDate(0, -6, 0)) {
        user.Status = "active"
    }
    
    c.JSON(200, user)
}
```

```go
// Good: Thin handlers, delegate to services
func getUserHandler(c *gin.Context) {
    userID := c.Param("id")
    
    user, err := userService.GetUserByID(userID)
    if err != nil {
        c.JSON(404, gin.H{"error": "User not found"})
        return
    }
    
    c.JSON(200, gin.H{"data": user})
}
```

### **Error Handling Patterns**

#### **✅ DO: Use custom error types**
```go
package domain

import "fmt"

type AppError struct {
    Code    string
    Message string
    Details map[string]interface{}
}

func (e AppError) Error() string {
    return e.Message
}

// Predefined errors
var (
    ErrUserNotFound = AppError{
        Code:    "USER_NOT_FOUND",
        Message: "User not found",
    }
    
    ErrEmailExists = AppError{
        Code:    "EMAIL_EXISTS", 
        Message: "Email already exists",
    }
)

// Usage in service
func (s *UserService) CreateUser(req CreateUserRequest) (*User, error) {
    if s.emailExists(req.Email) {
        return nil, ErrEmailExists
    }
    // ... create user
}
```

#### **✅ DO: Handle errors consistently in handlers**
```go
func (h *UserHandlers) CreateUser(c *gin.Context) {
    var req domain.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{
            "status": "error",
            "code":   "INVALID_INPUT",
            "message": err.Error(),
        })
        return
    }

    user, err := h.userService.CreateUser(req)
    if err != nil {
        if appErr, ok := err.(domain.AppError); ok {
            c.JSON(409, gin.H{
                "status": "error",
                "code":   appErr.Code,
                "message": appErr.Message,
            })
            return
        }
        
        // Unexpected error
        c.JSON(500, gin.H{
            "status": "error",
            "message": "Internal server error",
        })
        return
    }

    c.JSON(201, gin.H{
        "status": "success",
        "data":   user,
    })
}
```

### **Validation & Input Handling**

#### **✅ DO: Use struct tags for validation**
```go
type CreateUserRequest struct {
    Name     string `json:"name" binding:"required,min=2,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Age      int    `json:"age" binding:"required,min=18,max=120"`
    Website  string `json:"website" binding:"omitempty,url"`
}
```

#### **✅ DO: Sanitize and validate in service layer**
```go
func (s *UserService) CreateUser(req CreateUserRequest) (*User, error) {
    // Additional business validation
    if strings.Contains(req.Name, "@") {
        return nil, AppError{
            Code:    "INVALID_NAME",
            Message: "Name cannot contain @ symbol",
        }
    }
    
    // Sanitize input
    req.Name = strings.TrimSpace(req.Name)
    req.Email = strings.ToLower(strings.TrimSpace(req.Email))
    
    // ... proceed with creation
}
```

### **Configuration Management**

#### **✅ DO: Use environment-based configuration**
```go
package config

import (
    "os"
    "strconv"
)

type Config struct {
    Port         string
    DatabaseURL  string
    JWTSecret    string
    Environment  string
    LogLevel     string
}

func Load() *Config {
    return &Config{
        Port:        getEnv("PORT", "8080"),
        DatabaseURL: getEnv("DATABASE_URL", ""),
        JWTSecret:   getEnv("JWT_SECRET", ""),
        Environment: getEnv("ENVIRONMENT", "development"),
        LogLevel:    getEnv("LOG_LEVEL", "info"),
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

---

## 🎨 **Frontend Best Practices**

### **Component Organization**

#### **✅ DO: Use a clear component hierarchy**
```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Loading/
│   ├── layout/              # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── features/            # Feature-specific components
│       ├── auth/
│       ├── users/
│       └── dashboard/
├── hooks/                   # Custom React hooks
├── services/                # API communication
├── stores/                  # Global state (Zustand)
├── utils/                   # Helper functions
└── types/                   # TypeScript types (if using TS)
```

#### **✅ DO: Follow single responsibility principle**
```jsx
// Bad: Component doing too much
function UserDashboard() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    
    // 50+ lines of logic...
    
    return (
        <div>
            {/* Complex JSX */}
        </div>
    )
}
```

```jsx
// Good: Separate concerns
function UserDashboard() {
    return (
        <div>
            <UserSearch />
            <UserList />
            <UserModal />
        </div>
    )
}

function UserList() {
    const { data: users, isLoading } = useUsers()
    
    if (isLoading) return <LoadingSpinner />
    
    return (
        <div>
            {users.map(user => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    )
}
```

### **Custom Hooks Patterns**

#### **✅ DO: Create reusable data hooks**
```javascript
// hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'

export function useUsers(filters = {}) {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => userService.getUsers(filters),
        select: (data) => data.data,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useUser(id) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getUser(id),
        select: (data) => data.data,
        enabled: !!id, // Only run if id exists
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: userService.createUser,
        onSuccess: (newUser) => {
            // Update cache optimistically
            queryClient.setQueryData(['users'], (oldData) => {
                if (!oldData) return oldData
                return {
                    ...oldData,
                    data: [...oldData.data, newUser.data]
                }
            })
        },
    })
}
```

#### **✅ DO: Create UI state hooks**
```javascript
// hooks/useModal.js
import { useState } from 'react'

export function useModal() {
    const [isOpen, setIsOpen] = useState(false)
    
    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)
    const toggle = () => setIsOpen(prev => !prev)
    
    return { isOpen, open, close, toggle }
}

// hooks/useLocalStorage.js
import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            return initialValue
        }
    })

    const setValue = (value) => {
        try {
            setStoredValue(value)
            window.localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error saving to localStorage:`, error)
        }
    }

    return [storedValue, setValue]
}
```

### **Component Patterns**

#### **✅ DO: Use compound components for complex UI**
```jsx
// Good: Compound component pattern
function UserCard({ user, children }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {children}
        </div>
    )
}

UserCard.Header = function UserCardHeader({ user }) {
    return (
        <div className="flex items-center space-x-4">
            <img src={user.avatar} className="w-10 h-10 rounded-full" />
            <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-gray-500">{user.email}</p>
            </div>
        </div>
    )
}

UserCard.Actions = function UserCardActions({ children }) {
    return (
        <div className="flex space-x-2 mt-4">
            {children}
        </div>
    )
}

// Usage
function UserList() {
    return (
        <div>
            {users.map(user => (
                <UserCard key={user.id} user={user}>
                    <UserCard.Header user={user} />
                    <UserCard.Actions>
                        <Button variant="primary">Edit</Button>
                        <Button variant="danger">Delete</Button>
                    </UserCard.Actions>
                </UserCard>
            ))}
        </div>
    )
}
```

---

## 📡 **API Design Guidelines**

### **RESTful Conventions**

#### **✅ DO: Use consistent URL patterns**
```
GET    /api/users              # List users
GET    /api/users/:id          # Get specific user
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user (full)
PATCH  /api/users/:id          # Update user (partial)
DELETE /api/users/:id          # Delete user

# Nested resources
GET    /api/users/:id/orders   # Get user's orders
POST   /api/users/:id/orders   # Create order for user
```

#### **✅ DO: Use consistent response formats**
```json
// Success response
{
  "status": "success",
  "data": {
    "id": "123",
    "name": "John Doe"
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}

// Error response
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "email": ["Email is required"],
    "name": ["Name must be at least 2 characters"]
  }
}
```

#### **✅ DO: Use proper HTTP status codes**
```go
// Success codes
c.JSON(200, data)         // OK - successful GET, PUT, PATCH
c.JSON(201, data)         // Created - successful POST
c.JSON(204, nil)          // No Content - successful DELETE

// Client error codes
c.JSON(400, error)        // Bad Request - invalid input
c.JSON(401, error)        // Unauthorized - authentication required
c.JSON(403, error)        // Forbidden - insufficient permissions
c.JSON(404, error)        // Not Found - resource doesn't exist
c.JSON(409, error)        // Conflict - duplicate resource

// Server error codes
c.JSON(500, error)        // Internal Server Error
```

### **Pagination & Filtering**

#### **✅ DO: Implement consistent pagination**
```go
type PaginationParams struct {
    Page  int `form:"page" binding:"min=1"`
    Limit int `form:"limit" binding:"min=1,max=100"`
}

type PaginatedResponse struct {
    Data []interface{} `json:"data"`
    Meta PaginationMeta `json:"meta"`
}

type PaginationMeta struct {
    Total      int  `json:"total"`
    Page       int  `json:"page"`
    Limit      int  `json:"limit"`
    TotalPages int  `json:"total_pages"`
    HasNext    bool `json:"has_next"`
    HasPrev    bool `json:"has_prev"`
}

func (h *UserHandlers) GetUsers(c *gin.Context) {
    var params PaginationParams
    if err := c.ShouldBindQuery(&params); err != nil {
        // Set defaults
        params.Page = 1
        params.Limit = 20
    }
    
    users, total, err := h.userService.GetUsers(params)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    totalPages := (total + params.Limit - 1) / params.Limit
    
    response := PaginatedResponse{
        Data: users,
        Meta: PaginationMeta{
            Total:      total,
            Page:       params.Page,
            Limit:      params.Limit,
            TotalPages: totalPages,
            HasNext:    params.Page < totalPages,
            HasPrev:    params.Page > 1,
        },
    }
    
    c.JSON(200, gin.H{"status": "success", "data": response.Data, "meta": response.Meta})
}
```

---

## 🗃️ **State Management Patterns**

### **React Query Best Practices**

#### **✅ DO: Use query keys effectively**
```javascript
// Good: Structured query keys
const userKeys = {
    all: ['users'],
    lists: () => [...userKeys.all, 'list'],
    list: (filters) => [...userKeys.lists(), filters],
    details: () => [...userKeys.all, 'detail'],
    detail: (id) => [...userKeys.details(), id],
}

// Usage
function useUsers(filters) {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: () => userService.getUsers(filters),
    })
}

function useUser(id) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => userService.getUser(id),
    })
}

// Invalidate all user queries
queryClient.invalidateQueries(userKeys.all)

// Invalidate only user lists
queryClient.invalidateQueries(userKeys.lists())
```

#### **✅ DO: Handle optimistic updates properly**
```javascript
export function useUpdateUser() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ id, updates }) => userService.updateUser(id, updates),
        
        // Optimistic update
        onMutate: async ({ id, updates }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries(userKeys.detail(id))
            
            // Snapshot previous value
            const previousUser = queryClient.getQueryData(userKeys.detail(id))
            
            // Optimistically update
            queryClient.setQueryData(userKeys.detail(id), (old) => ({
                ...old,
                ...updates
            }))
            
            return { previousUser, id }
        },
        
        // Rollback on error
        onError: (err, variables, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(
                    userKeys.detail(context.id), 
                    context.previousUser
                )
            }
        },
        
        // Always refetch after error or success
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries(userKeys.detail(variables.id))
        },
    })
}
```

### **Zustand Best Practices**

#### **✅ DO: Structure stores by domain**
```javascript
// stores/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            
            login: (user, token) => set({
                user,
                token,
                isAuthenticated: true,
            }),
            
            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false,
            }),
            
            updateProfile: (updates) => set((state) => ({
                user: { ...state.user, ...updates }
            })),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

// stores/uiStore.js
export const useUIStore = create((set) => ({
    theme: 'light',
    sidebarOpen: false,
    notifications: [],
    
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
    })),
    
    toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
    })),
    
    addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
            id: Date.now(),
            ...notification
        }]
    })),
    
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),
}))
```

---

## 🚨 **Error Handling Strategies**

### **Frontend Error Boundaries**

#### **✅ DO: Implement error boundaries for React**
```jsx
// components/ErrorBoundary.jsx
import { Component } from 'react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
        // Log to error reporting service
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We're sorry for the inconvenience. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Usage in App.jsx
function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <Routes>
                        {/* Your routes */}
                    </Routes>
                </Router>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}
```

### **API Error Handling**

#### **✅ DO: Create centralized error handling**
```javascript
// services/apiClient.js
import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            clearAuth()
            window.location.href = '/login'
        }
        
        if (error.response?.status >= 500) {
            // Show global error notification
            showErrorNotification('Server error occurred')
        }
        
        return Promise.reject(error)
    }
)

export default apiClient
```

---

## ⚡ **Performance Optimization**

### **Backend Performance**

#### **✅ DO: Use database connection pooling**
```go
import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func initDB() *gorm.DB {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }
    
    sqlDB, err := db.DB()
    if err != nil {
        panic("failed to get underlying sql.DB")
    }
    
    // Configure connection pool
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    
    return db
}
```

#### **✅ DO: Add caching for expensive operations**
```go
import (
    "context"
    "encoding/json"
    "time"
    "github.com/go-redis/redis/v8"
)

type CacheService struct {
    client *redis.Client
}

func (c *CacheService) Get(key string, dest interface{}) error {
    val, err := c.client.Get(context.Background(), key).Result()
    if err != nil {
        return err
    }
    return json.Unmarshal([]byte(val), dest)
}

func (c *CacheService) Set(key string, value interface{}, expiration time.Duration) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }
    return c.client.Set(context.Background(), key, data, expiration).Err()
}

// Usage in service
func (s *UserService) GetUserByID(id string) (*User, error) {
    cacheKey := fmt.Sprintf("user:%s", id)
    
    // Try cache first
    var user User
    if err := s.cache.Get(cacheKey, &user); err == nil {
        return &user, nil
    }
    
    // Fallback to database
    user, err := s.repo.GetByID(id)
    if err != nil {
        return nil, err
    }
    
    // Cache the result
    s.cache.Set(cacheKey, user, 5*time.Minute)
    
    return &user, nil
}
```

### **Frontend Performance**

#### **✅ DO: Implement code splitting**
```jsx
// Use React.lazy for route-based code splitting
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const UserManagement = lazy(() => import('./pages/UserManagement'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Suspense>
    )
}
```

#### **✅ DO: Optimize React Query cache**
```javascript
// Configure React Query for optimal performance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,      // 5 minutes
            cacheTime: 10 * 60 * 1000,     // 10 minutes
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors
                if (error.response?.status >= 400 && error.response?.status < 500) {
                    return false
                }
                return failureCount < 3
            },
            refetchOnWindowFocus: false,    // Disable refetch on focus
            refetchOnMount: false,          // Only refetch if data is stale
        },
    },
})
```

---

## 🧪 **Testing Guidelines**

### **Backend Testing**

#### **✅ DO: Write table-driven tests**
```go
func TestUserService_CreateUser(t *testing.T) {
    tests := []struct {
        name    string
        request CreateUserRequest
        wantErr bool
        errCode string
    }{
        {
            name: "valid user",
            request: CreateUserRequest{
                Name:  "John Doe",
                Email: "john@example.com",
            },
            wantErr: false,
        },
        {
            name: "duplicate email",
            request: CreateUserRequest{
                Name:  "Jane Doe",
                Email: "existing@example.com",
            },
            wantErr: true,
            errCode: "EMAIL_EXISTS",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            service := NewUserService()
            
            user, err := service.CreateUser(tt.request)
            
            if tt.wantErr {
                assert.Error(t, err)
                if tt.errCode != "" {
                    appErr, ok := err.(AppError)
                    assert.True(t, ok)
                    assert.Equal(t, tt.errCode, appErr.Code)
                }
            } else {
                assert.NoError(t, err)
                assert.Equal(t, tt.request.Name, user.Name)
                assert.Equal(t, tt.request.Email, user.Email)
            }
        })
    }
}
```

### **Frontend Testing**

#### **✅ DO: Test components with React Testing Library**
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserList from './UserList'

// Test wrapper with providers
function TestWrapper({ children }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('UserList', () => {
    test('displays loading state initially', () => {
        render(<UserList />, { wrapper: TestWrapper })
        
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
    
    test('displays users after loading', async () => {
        // Mock API response
        jest.spyOn(userService, 'getUsers').mockResolvedValue({
            data: [
                { id: '1', name: 'John Doe', email: 'john@example.com' }
            ]
        })
        
        render(<UserList />, { wrapper: TestWrapper })
        
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })
    })
    
    test('creates new user when form is submitted', async () => {
        const mockCreate = jest.spyOn(userService, 'createUser')
            .mockResolvedValue({ data: { id: '2', name: 'Jane Doe', email: 'jane@example.com' } })
        
        render(<UserList />, { wrapper: TestWrapper })
        
        // Open form
        fireEvent.click(screen.getByText('Add User'))
        
        // Fill form
        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'Jane Doe' }
        })
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'jane@example.com' }
        })
        
        // Submit
        fireEvent.click(screen.getByText('Create User'))
        
        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith({
                name: 'Jane Doe',
                email: 'jane@example.com'
            })
        })
    })
})
```

---

## 🔒 **Security Best Practices**

### **Input Validation & Sanitization**

#### **✅ DO: Validate at multiple layers**
```go
// 1. HTTP layer validation
type CreateUserRequest struct {
    Name  string `json:"name" binding:"required,min=2,max=50"`
    Email string `json:"email" binding:"required,email"`
}

// 2. Business layer validation
func (s *UserService) CreateUser(req CreateUserRequest) (*User, error) {
    // Sanitize input
    req.Name = strings.TrimSpace(req.Name)
    req.Email = strings.ToLower(strings.TrimSpace(req.Email))
    
    // Business rules validation
    if s.isEmailBlacklisted(req.Email) {
        return nil, ErrEmailBlacklisted
    }
    
    // Check for SQL injection patterns
    if containsSQLInjection(req.Name) {
        return nil, ErrInvalidInput
    }
    
    return s.repo.Create(req)
}
```

#### **✅ DO: Implement rate limiting**
```go
import "golang.org/x/time/rate"

func rateLimitMiddleware() gin.HandlerFunc {
    limiter := rate.NewLimiter(rate.Limit(10), 20) // 10 req/sec, burst of 20
    
    return gin.HandlerFunc(func(c *gin.Context) {
        if !limiter.Allow() {
            c.JSON(429, gin.H{
                "error": "Rate limit exceeded",
            })
            c.Abort()
            return
        }
        c.Next()
    })
}
```

---

Following these best practices will help you build robust, maintainable, and scalable applications with Greact-Bones. Remember: **consistency is key** – establish patterns early and stick to them throughout your project. 