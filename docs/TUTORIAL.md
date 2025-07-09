# 🎓 **Greact-Bones Tutorial: Building Your First Feature**

> **A hands-on guide to building a complete feature from backend to frontend**

Welcome to the Greact-Bones tutorial! This guide will walk you through building a **User Management** feature from scratch, teaching you the patterns and best practices used in this skeleton.

## 🎯 **What You'll Learn**

By the end of this tutorial, you'll understand:
- How to create REST API endpoints in Go
- How to build React components with Tailwind CSS
- How to manage server state with TanStack Query
- How to handle forms and user interactions
- How frontend and backend communicate

## 📋 **Prerequisites**

- ✅ Greact-Bones setup complete (both servers running)
- ✅ Basic knowledge of Go and React
- ✅ Understanding of REST APIs and HTTP methods

## 🚀 **Tutorial Overview**

We'll build a **User Management System** with the following features:
1. **Display a list of users** (GET /api/users)
2. **Add new users** (POST /api/users)  
3. **Delete users** (DELETE /api/users/:id)
4. **Real-time UI updates** with optimistic updates

---

## 📝 **Step 1: Backend - Create User Model & Endpoints**

### **1.1 Define the User Model**

Create `backend/internal/domain/user.go`:

```go
package domain

import "time"

// User represents a user in our system
type User struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

// CreateUserRequest represents the data needed to create a user
type CreateUserRequest struct {
    Name  string `json:"name" binding:"required,min=2,max=50"`
    Email string `json:"email" binding:"required,email"`
}

// UserResponse represents the user data sent to clients
type UserResponse struct {
    ID        string `json:"id"`
    Name      string `json:"name"`
    Email     string `json:"email"`
    CreatedAt string `json:"created_at"`
}
```

### **1.2 Create User Service**

Create `backend/internal/domain/user_service.go`:

```go
package domain

import (
    "fmt"
    "time"
    "github.com/google/uuid"
)

// UserService handles user business logic
type UserService struct {
    users []User // In-memory storage for this tutorial
}

func NewUserService() *UserService {
    return &UserService{
        users: []User{
            {
                ID:        "1",
                Name:      "John Doe",
                Email:     "john@example.com",
                CreatedAt: time.Now(),
            },
            {
                ID:        "2", 
                Name:      "Jane Smith",
                Email:     "jane@example.com",
                CreatedAt: time.Now(),
            },
        },
    }
}

func (s *UserService) GetUsers() []UserResponse {
    responses := make([]UserResponse, len(s.users))
    for i, user := range s.users {
        responses[i] = UserResponse{
            ID:        user.ID,
            Name:      user.Name,
            Email:     user.Email,
            CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
        }
    }
    return responses
}

func (s *UserService) CreateUser(req CreateUserRequest) (UserResponse, error) {
    // Check if email already exists
    for _, user := range s.users {
        if user.Email == req.Email {
            return UserResponse{}, fmt.Errorf("email already exists")
        }
    }

    user := User{
        ID:        uuid.New().String(),
        Name:      req.Name,
        Email:     req.Email,
        CreatedAt: time.Now(),
    }

    s.users = append(s.users, user)

    return UserResponse{
        ID:        user.ID,
        Name:      user.Name,
        Email:     user.Email,
        CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
    }, nil
}

func (s *UserService) DeleteUser(id string) error {
    for i, user := range s.users {
        if user.ID == id {
            s.users = append(s.users[:i], s.users[i+1:]...)
            return nil
        }
    }
    return fmt.Errorf("user not found")
}
```

### **1.3 Create API Handlers**

Create `backend/internal/api/user_handlers.go`:

```go
package api

import (
    "net/http"
    "greact-bones/backend/internal/domain"
    "github.com/gin-gonic/gin"
)

type UserHandlers struct {
    userService *domain.UserService
}

func NewUserHandlers(userService *domain.UserService) *UserHandlers {
    return &UserHandlers{userService: userService}
}

func (h *UserHandlers) GetUsers(c *gin.Context) {
    users := h.userService.GetUsers()
    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "data":   users,
    })
}

func (h *UserHandlers) CreateUser(c *gin.Context) {
    var req domain.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "status": "error",
            "message": err.Error(),
        })
        return
    }

    user, err := h.userService.CreateUser(req)
    if err != nil {
        c.JSON(http.StatusConflict, gin.H{
            "status": "error",
            "message": err.Error(),
        })
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "status": "success",
        "data":   user,
    })
}

func (h *UserHandlers) DeleteUser(c *gin.Context) {
    id := c.Param("id")
    
    err := h.userService.DeleteUser(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "status": "error",
            "message": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "message": "User deleted successfully",
    })
}
```

### **1.4 Update Main Server**

Update `backend/cmd/api/main.go` to include user routes:

```go
package main

import (
    "net/http"
    "greact-bones/backend/internal/api"
    "greact-bones/backend/internal/domain"
    "github.com/gin-gonic/gin"
)

func main() {
    // Create services
    userService := domain.NewUserService()
    userHandlers := api.NewUserHandlers(userService)

    // Create router
    router := gin.Default()

    // CORS middleware
    router.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    })

    // Health check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":  "ok", 
            "message": "Greact-Bones API is running!",
        })
    })

    // API routes
    api := router.Group("/api")
    {
        api.GET("/hello", func(c *gin.Context) {
            c.JSON(http.StatusOK, gin.H{
                "message": "Hello from Greact-Bones backend!",
                "version": "1.0.0",
            })
        })

        // User routes
        api.GET("/users", userHandlers.GetUsers)
        api.POST("/users", userHandlers.CreateUser)
        api.DELETE("/users/:id", userHandlers.DeleteUser)
    }

    router.Run(":8080")
}
```

**Install UUID dependency:**
```bash
cd backend
go get github.com/google/uuid
```

---

## 🎨 **Step 2: Frontend - Build User Management UI**

### **2.1 Create User Service**

Create `frontend/src/services/userService.js`:

```javascript
import axios from 'axios'

const API_BASE = 'http://localhost:8080/api'

export const userService = {
  async getUsers() {
    const response = await axios.get(`${API_BASE}/users`)
    return response.data
  },

  async createUser(userData) {
    const response = await axios.post(`${API_BASE}/users`, userData)
    return response.data
  },

  async deleteUser(userId) {
    const response = await axios.delete(`${API_BASE}/users/${userId}`)
    return response.data
  }
}
```

### **2.2 Create Custom Hooks**

Create `frontend/src/hooks/useUsers.js`:

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    select: (data) => data.data, // Extract users from response
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // Invalidate and refetch users after creating
      queryClient.invalidateQueries(['users'])
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      // Invalidate and refetch users after deletion
      queryClient.invalidateQueries(['users'])
    },
  })
}
```

### **2.3 Create User Components**

Create `frontend/src/components/UserList.jsx`:

```jsx
import { useState } from 'react'
import { useUsers, useCreateUser, useDeleteUser } from '../hooks/useUsers'

export default function UserList() {
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [isFormVisible, setIsFormVisible] = useState(false)

  const { data: users, isLoading, error } = useUsers()
  const createUserMutation = useCreateUser()
  const deleteUserMutation = useDeleteUser()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createUserMutation.mutateAsync(newUser)
      setNewUser({ name: '', email: '' })
      setIsFormVisible(false)
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserMutation.mutateAsync(userId)
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">Error loading users: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isFormVisible ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Add User Form */}
      {isFormVisible && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createUserMutation.isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 transition-colors"
              >
                {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Users ({users?.length || 0})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users?.map((user) => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">Created: {user.created_at}</p>
              </div>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deleteUserMutation.isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400 transition-colors"
              >
                {deleteUserMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### **2.4 Setup React Query Provider**

Update `frontend/src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

### **2.5 Install Frontend Dependencies**

```bash
cd frontend
npm install axios @tanstack/react-query
```

### **2.6 Update App Component**

Update `frontend/src/App.jsx` to include the new UserList:

```jsx
import { useState } from 'react'
import UserList from './components/UserList'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')

  const renderView = () => {
    switch (currentView) {
      case 'users':
        return <UserList />
      default:
        return <HomeView setCurrentView={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Greact-Bones</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'home' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('users')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-8">
        {renderView()}
      </main>
    </div>
  )
}

// Original home view component
function HomeView({ setCurrentView }) {
  const [apiResponse, setApiResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const testBackendConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/hello')
      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      setApiResponse({ error: 'Failed to connect to backend. Make sure the Go server is running on port 8080.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Greact-Bones
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          A modern full-stack skeleton with Go + React
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Quick Start
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={testBackendConnection}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Testing...' : 'Test API Connection'}
            </button>
            
            <button
              onClick={() => setCurrentView('users')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Try User Management
            </button>
          </div>
          
          {apiResponse && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                API Response:
              </h4>
              <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
```

---

## 🧪 **Step 3: Test Your Feature**

### **3.1 Restart Servers**

1. **Backend**: Restart to load new code
   ```bash
   cd backend
   go run cmd/api/main.go
   ```

2. **Frontend**: Should auto-reload with Vite
   ```bash
   # If needed:
   cd frontend
   npm run dev
   ```

### **3.2 Test the Feature**

1. **Open http://localhost:5173**
2. **Click "Try User Management"** in the navigation
3. **Test the features**:
   - View the list of users (should show 2 default users)
   - Click "Add User" and create a new user
   - Delete a user using the delete button
   - Watch real-time updates without page refresh!

---

## 🎉 **Congratulations!**

You've successfully built a complete feature using the Greact-Bones patterns:

### **What You Learned:**
- ✅ **Backend**: Models, services, handlers, and routing in Go
- ✅ **Frontend**: Components, hooks, and state management with React Query
- ✅ **Integration**: How frontend and backend communicate via REST API
- ✅ **Best Practices**: Clean architecture and separation of concerns

### **Key Patterns:**
1. **Service Layer**: Business logic separated from HTTP handling
2. **Custom Hooks**: Reusable data fetching logic
3. **Optimistic Updates**: UI updates immediately, then syncs with server
4. **Error Handling**: Graceful error states and user feedback

## 🚀 **Next Steps**

Try extending this feature:
- Add user editing functionality
- Implement search and filtering
- Add pagination for large user lists
- Add form validation
- Persist data with a real database

---

**Happy coding!** You now have the foundation to build any feature in Greact-Bones! 🦴 