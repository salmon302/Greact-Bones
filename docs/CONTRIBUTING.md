# 🤝 **Contributing to Greact-Bones**

> **Guidelines for contributing to the project and maintaining code quality**

We welcome contributions from the community! This guide explains how to contribute effectively to Greact-Bones, maintain code quality, and collaborate with other developers.

## 📋 **Table of Contents**

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Coding Standards](#-coding-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation Standards](#-documentation-standards)
- [Pull Request Process](#-pull-request-process)
- [Community Guidelines](#-community-guidelines)

---

## 📜 **Code of Conduct**

### **Our Pledge**

We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### **Our Standards**

**Examples of behavior that contributes to creating a positive environment:**

- ✅ Using welcoming and inclusive language
- ✅ Being respectful of differing viewpoints and experiences
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community
- ✅ Showing empathy towards other community members

**Examples of unacceptable behavior:**

- ❌ The use of sexualized language or imagery
- ❌ Trolling, insulting/derogatory comments, and personal or political attacks
- ❌ Public or private harassment
- ❌ Publishing others' private information without explicit permission
- ❌ Other conduct which could reasonably be considered inappropriate

---

## 🚀 **Getting Started**

### **Prerequisites**

Before contributing, ensure you have:

- **Go 1.21+** installed and configured
- **Node.js 18+** and npm installed
- **Git** configured with your GitHub credentials
- A **GitHub account** for submitting pull requests
- Familiarity with **Go**, **React**, and **REST APIs**

### **Fork and Clone**

1. **Fork the repository** on GitHub
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/greact-bones.git
   cd greact-bones
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/greact-bones.git
   ```

4. **Verify remotes**:
   ```bash
   git remote -v
   # origin    https://github.com/YOUR_USERNAME/greact-bones.git (fetch)
   # origin    https://github.com/YOUR_USERNAME/greact-bones.git (push)
   # upstream  https://github.com/ORIGINAL_OWNER/greact-bones.git (fetch)
   # upstream  https://github.com/ORIGINAL_OWNER/greact-bones.git (push)
   ```

### **Development Setup**

1. **Install backend dependencies**:
   ```bash
   cd backend
   go mod tidy
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start development servers**:
   ```bash
   # Terminal 1: Backend
   cd backend
   go run cmd/api/main.go

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

4. **Verify setup**: Visit `http://localhost:5173` and test API connection

---

## 🔄 **Development Workflow**

### **Branching Strategy**

We use **Git Flow** with these branch types:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/`**: New features (`feature/user-authentication`)
- **`fix/`**: Bug fixes (`fix/cors-headers`)
- **`docs/`**: Documentation updates (`docs/api-documentation`)

### **Creating a Feature Branch**

```bash
# Ensure you're on the latest develop branch
git checkout develop
git pull upstream develop

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add user authentication system"

# Push to your fork
git push origin feature/your-feature-name
```

### **Keeping Your Fork Updated**

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your feature branch on latest develop
git checkout feature/your-feature-name
git rebase upstream/develop

# Force push to update your PR
git push origin feature/your-feature-name --force-with-lease
```

### **Commit Message Format**

We follow the **Conventional Commits** specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### **Types**:
- **`feat`**: New feature
- **`fix`**: Bug fix
- **`docs`**: Documentation changes
- **`style`**: Code style changes (formatting, etc.)
- **`refactor`**: Code refactoring
- **`test`**: Adding or updating tests
- **`chore`**: Maintenance tasks

#### **Examples**:
```bash
feat(auth): add JWT token validation middleware
fix(api): resolve CORS header configuration issue
docs(readme): update installation instructions
refactor(user): extract user service to separate package
test(api): add integration tests for user endpoints
```

---

## 📏 **Coding Standards**

### **Go Code Standards**

#### **Follow Go Conventions**

```go
// ✅ Good: Idiomatic Go
type UserService struct {
    repo UserRepository
    logger *zap.Logger
}

func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*User, error) {
    if err := s.validateUser(req); err != nil {
        return nil, fmt.Errorf("validation failed: %w", err)
    }
    
    user := &User{
        ID:    uuid.New(),
        Name:  req.Name,
        Email: req.Email,
    }
    
    return s.repo.Create(ctx, user)
}
```

#### **Error Handling**

```go
// ✅ Good: Proper error wrapping
func (s *UserService) GetUser(id string) (*User, error) {
    user, err := s.repo.GetByID(id)
    if err != nil {
        if errors.Is(err, ErrUserNotFound) {
            return nil, ErrUserNotFound
        }
        return nil, fmt.Errorf("failed to get user %s: %w", id, err)
    }
    return user, nil
}

// ❌ Bad: Swallowing errors
func (s *UserService) GetUser(id string) *User {
    user, _ := s.repo.GetByID(id) // Don't ignore errors!
    return user
}
```

#### **Package Organization**

```go
// ✅ Good: Clear package structure
package domain

// User represents a user in the system
type User struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

// UserRepository defines the interface for user data access
type UserRepository interface {
    Create(user *User) error
    GetByID(id string) (*User, error)
    GetByEmail(email string) (*User, error)
}
```

### **React Code Standards**

#### **Component Structure**

```jsx
// ✅ Good: Functional component with hooks
import { useState, useEffect } from 'react'
import { useUsers } from '../hooks/useUsers'

export default function UserList() {
    const [searchTerm, setSearchTerm] = useState('')
    const { data: users, isLoading, error } = useUsers({ search: searchTerm })

    if (isLoading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} />

    return (
        <div className="user-list">
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
            <UserGrid users={users} />
        </div>
    )
}
```

#### **Custom Hooks**

```javascript
// ✅ Good: Reusable hook with proper naming
export function useUserForm(initialUser = null) {
    const [formData, setFormData] = useState(initialUser || { name: '', email: '' })
    const [errors, setErrors] = useState({})
    
    const validateForm = () => {
        const newErrors = {}
        if (!formData.name) newErrors.name = 'Name is required'
        if (!formData.email) newErrors.email = 'Email is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    
    const resetForm = () => {
        setFormData(initialUser || { name: '', email: '' })
        setErrors({})
    }
    
    return { formData, setFormData, errors, validateForm, resetForm }
}
```

#### **CSS/Tailwind Classes**

```jsx
// ✅ Good: Organized, readable classes
function UserCard({ user }) {
    return (
        <div className="
            bg-white rounded-lg shadow-md 
            p-6 hover:shadow-lg 
            transition-shadow duration-200
        ">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user.name}
            </h3>
            <p className="text-sm text-gray-600">
                {user.email}
            </p>
        </div>
    )
}

// ❌ Bad: Too many classes on one line
function UserCard({ user }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200 mb-4">
            {/* Content */}
        </div>
    )
}
```

### **API Design Standards**

#### **RESTful Endpoints**

```go
// ✅ Good: RESTful resource naming
router.GET("/api/users", handlers.GetUsers)           // List users
router.GET("/api/users/:id", handlers.GetUser)        // Get specific user
router.POST("/api/users", handlers.CreateUser)        // Create user
router.PUT("/api/users/:id", handlers.UpdateUser)     // Update user
router.DELETE("/api/users/:id", handlers.DeleteUser)  // Delete user
```

#### **Response Format**

```go
// ✅ Good: Consistent response structure
type APIResponse struct {
    Status  string      `json:"status"`
    Data    interface{} `json:"data,omitempty"`
    Message string      `json:"message,omitempty"`
    Meta    *Meta       `json:"meta,omitempty"`
}

type Meta struct {
    Total      int  `json:"total"`
    Page       int  `json:"page"`
    Limit      int  `json:"limit"`
    TotalPages int  `json:"total_pages"`
}

// Usage
c.JSON(http.StatusOK, APIResponse{
    Status: "success",
    Data:   users,
    Meta: &Meta{
        Total: total,
        Page:  page,
        Limit: limit,
    },
})
```

---

## 🧪 **Testing Guidelines**

### **Backend Testing**

#### **Unit Tests**

```go
// backend/internal/domain/user_service_test.go
package domain

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

func TestUserService_CreateUser(t *testing.T) {
    tests := []struct {
        name        string
        request     CreateUserRequest
        wantErr     bool
        expectedErr error
    }{
        {
            name: "valid user creation",
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
            wantErr:     true,
            expectedErr: ErrEmailExists,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockRepo := &MockUserRepository{}
            service := NewUserService(mockRepo)

            if tt.expectedErr == ErrEmailExists {
                mockRepo.On("GetByEmail", tt.request.Email).Return(nil, ErrEmailExists)
            } else {
                mockRepo.On("GetByEmail", tt.request.Email).Return(nil, ErrUserNotFound)
                mockRepo.On("Create", mock.AnythingOfType("*domain.User")).Return(nil)
            }

            user, err := service.CreateUser(tt.request)

            if tt.wantErr {
                assert.Error(t, err)
                assert.Equal(t, tt.expectedErr, err)
                assert.Nil(t, user)
            } else {
                assert.NoError(t, err)
                assert.NotNil(t, user)
                assert.Equal(t, tt.request.Name, user.Name)
            }

            mockRepo.AssertExpectations(t)
        })
    }
}
```

#### **Integration Tests**

```go
// backend/tests/integration/user_api_test.go
func TestUserAPI_Integration(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)

    router := setupRouter(db)
    
    t.Run("create and get user", func(t *testing.T) {
        // Create user
        createReq := CreateUserRequest{
            Name:  "Test User",
            Email: "test@example.com",
        }
        
        reqBody, _ := json.Marshal(createReq)
        req := httptest.NewRequest("POST", "/api/users", bytes.NewBuffer(reqBody))
        req.Header.Set("Content-Type", "application/json")
        
        w := httptest.NewRecorder()
        router.ServeHTTP(w, req)
        
        assert.Equal(t, http.StatusCreated, w.Code)
        
        var createResp APIResponse
        json.Unmarshal(w.Body.Bytes(), &createResp)
        assert.Equal(t, "success", createResp.Status)
        
        // Get created user
        userID := createResp.Data.(map[string]interface{})["id"].(string)
        
        req = httptest.NewRequest("GET", "/api/users/"+userID, nil)
        w = httptest.NewRecorder()
        router.ServeHTTP(w, req)
        
        assert.Equal(t, http.StatusOK, w.Code)
    })
}
```

### **Frontend Testing**

#### **Component Tests**

```jsx
// frontend/src/components/__tests__/UserList.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserList from '../UserList'
import * as userService from '../../services/userService'

// Mock the userService
jest.mock('../../services/userService')

const createTestWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('UserList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('displays loading state initially', () => {
        userService.getUsers.mockImplementation(() => new Promise(() => {}))
        
        render(<UserList />, { wrapper: createTestWrapper() })
        
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    test('displays users after loading', async () => {
        const mockUsers = [
            { id: '1', name: 'John Doe', email: 'john@example.com' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        ]
        
        userService.getUsers.mockResolvedValue({ data: mockUsers })
        
        render(<UserList />, { wrapper: createTestWrapper() })
        
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        })
    })

    test('creates new user when form is submitted', async () => {
        const mockUsers = []
        const newUser = { id: '3', name: 'New User', email: 'new@example.com' }
        
        userService.getUsers.mockResolvedValue({ data: mockUsers })
        userService.createUser.mockResolvedValue({ data: newUser })
        
        render(<UserList />, { wrapper: createTestWrapper() })
        
        // Open form
        fireEvent.click(screen.getByText('Add User'))
        
        // Fill form
        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'New User' }
        })
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'new@example.com' }
        })
        
        // Submit
        fireEvent.click(screen.getByText('Create User'))
        
        await waitFor(() => {
            expect(userService.createUser).toHaveBeenCalledWith({
                name: 'New User',
                email: 'new@example.com'
            })
        })
    })
})
```

### **Running Tests**

```bash
# Backend tests
cd backend
go test ./... -v

# Frontend tests
cd frontend
npm test

# Coverage reports
cd backend
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out

cd frontend
npm test -- --coverage
```

---

## 📖 **Documentation Standards**

### **Code Documentation**

#### **Go Documentation**

```go
// Package domain contains the core business logic and entities for the application.
package domain

// User represents a user entity in the system.
// It contains all the necessary information to identify and authenticate a user.
type User struct {
    // ID is the unique identifier for the user
    ID string `json:"id"`
    
    // Name is the display name of the user
    Name string `json:"name"`
    
    // Email is the unique email address used for authentication
    Email string `json:"email"`
    
    // CreatedAt is the timestamp when the user was created
    CreatedAt time.Time `json:"created_at"`
}

// CreateUser creates a new user in the system.
// It validates the input, checks for duplicate emails, and persists the user.
//
// Parameters:
//   - req: The user creation request containing name and email
//
// Returns:
//   - *User: The created user with generated ID and timestamp
//   - error: Any error that occurred during creation
//
// Example:
//   user, err := service.CreateUser(CreateUserRequest{
//       Name:  "John Doe",
//       Email: "john@example.com",
//   })
func (s *UserService) CreateUser(req CreateUserRequest) (*User, error) {
    // Implementation...
}
```

#### **React Component Documentation**

```jsx
/**
 * UserList component displays a list of users with create/delete functionality.
 * 
 * Features:
 * - Displays users in a paginated list
 * - Allows creation of new users via a form
 * - Supports user deletion with confirmation
 * - Shows loading and error states
 * 
 * @example
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <UserList />
 *     </QueryClientProvider>
 *   )
 * }
 */
export default function UserList() {
    // Component implementation...
}
```

### **README Updates**

When adding features, update the relevant README sections:

- **Installation instructions** if new dependencies are added
- **Usage examples** for new API endpoints or components
- **Configuration** if new environment variables are needed

### **API Documentation**

For new API endpoints, add examples:

```markdown
### Create User

**POST** `/api/users`

Creates a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**Error Response:** `409 Conflict`
```json
{
  "status": "error",
  "code": "EMAIL_EXISTS",
  "message": "Email already exists"
}
```
```

---

## 🔄 **Pull Request Process**

### **Before Submitting**

1. **✅ Ensure your branch is up to date** with `develop`
2. **✅ Run all tests** and ensure they pass
3. **✅ Run linters** and fix any issues
4. **✅ Update documentation** if needed
5. **✅ Test manually** in both development and production builds

### **Pull Request Checklist**

```markdown
## Pull Request Checklist

- [ ] Code follows the project coding standards
- [ ] All tests pass (backend: `go test ./...`, frontend: `npm test`)
- [ ] New code has appropriate test coverage
- [ ] Documentation has been updated (if applicable)
- [ ] Commit messages follow conventional commit format
- [ ] PR title clearly describes the change
- [ ] Breaking changes are documented

## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

Describe the tests that you ran to verify your changes.

## Screenshots

If applicable, add screenshots to help explain your changes.
```

### **Review Process**

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, the PR can be merged

### **Merge Guidelines**

- **Squash and merge** for feature branches
- **Rebase and merge** for small bug fixes
- **Create a merge commit** for releases

---

## 👥 **Community Guidelines**

### **Getting Help**

- **📖 Documentation**: Check existing docs first
- **🐛 Issues**: Search existing issues before creating new ones
- **💬 Discussions**: Use GitHub Discussions for questions
- **📧 Email**: Contact maintainers for sensitive issues

### **Reporting Issues**

When reporting bugs, include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Environment details** (Go version, Node version, OS)
5. **Code samples** or screenshots if applicable

### **Suggesting Features**

For feature requests:

1. **Check existing issues** to avoid duplicates
2. **Explain the use case** and why it's needed
3. **Provide examples** of how it would work
4. **Consider backward compatibility**

### **Recognition**

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub discussions** for helpful community support

---

## 🎯 **Development Tips**

### **Quick Development Setup**

```bash
# One-time setup script
./scripts/setup-dev.sh

# Daily development
./scripts/start-dev.sh  # Starts both servers in tmux sessions
```

### **Useful Commands**

```bash
# Backend
cd backend
go mod tidy                    # Update dependencies
go test ./... -v               # Run tests with verbose output
go run -race cmd/api/main.go   # Run with race detection
golangci-lint run              # Run linter

# Frontend
cd frontend
npm install                    # Install dependencies
npm test -- --watch           # Run tests in watch mode
npm run lint                   # Run ESLint
npm run lint -- --fix         # Auto-fix linting issues
```

### **Debug Tools**

- **Backend**: Use Delve debugger (`dlv debug`)
- **Frontend**: React Developer Tools browser extension
- **API Testing**: Postman or curl for API testing
- **Database**: PgAdmin or similar for database inspection

---

Thank you for contributing to Greact-Bones! Your efforts help make this project better for everyone. 🎉

If you have questions about contributing, please don't hesitate to reach out through GitHub issues or discussions. 