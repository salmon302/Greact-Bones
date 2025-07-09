# 🔧 **Greact-Bones Troubleshooting Guide**

> **Solutions to common issues and problems you might encounter**

This guide helps you resolve common issues when developing with Greact-Bones. Follow the step-by-step solutions to get back on track quickly.

## 📋 **Table of Contents**

- [Environment Setup Issues](#-environment-setup-issues)
- [Backend (Go) Problems](#-backend-go-problems)
- [Frontend (React) Problems](#-frontend-react-problems)
- [API Communication Issues](#-api-communication-issues)
- [Development Workflow Issues](#-development-workflow-issues)
- [Performance Problems](#-performance-problems)
- [Common Error Messages](#-common-error-messages)

---

## 🌍 **Environment Setup Issues**

### **Go Command Not Recognized (Windows)**

**Problem**: `'go' is not recognized as an internal or external command`

**Solutions**:

1. **Verify Go Installation**:
   ```cmd
   dir "C:\Program Files\Go\bin"
   ```
   or
   ```cmd
   dir "C:\Program Files (x86)\Go\bin"
   ```

2. **Check System PATH**:
   - Open System Properties → Advanced → Environment Variables
   - In System Variables, find "Path" and edit it
   - Ensure these paths are present:
     - `C:\Program Files\Go\bin` (or `C:\Program Files (x86)\Go\bin`)
     - `%USERPROFILE%\go\bin`

3. **Quick Fix - Use Full Path**:
   ```cmd
   "C:\Program Files\Go\bin\go.exe" version
   "C:\Program Files (x86)\Go\bin\go.exe" version
   ```

4. **Use the Batch File**:
   ```cmd
   cd backend
   start-server.bat
   ```

5. **Refresh Environment Variables**:
   ```cmd
   refreshenv
   ```
   Or restart your terminal completely.

### **Node.js/NPM Issues**

**Problem**: `'npm' is not recognized` or `'node' is not recognized`

**Solutions**:

1. **Download and Install Node.js**:
   - Visit [nodejs.org](https://nodejs.org)
   - Download LTS version (18+)
   - Run installer and restart terminal

2. **Verify Installation**:
   ```cmd
   node --version
   npm --version
   ```

3. **Fix NPM PATH Issues**:
   ```cmd
   npm config get prefix
   # Should show a path like C:\Users\{username}\AppData\Roaming\npm
   ```

### **Git Issues**

**Problem**: `'git' is not recognized`

**Solutions**:

1. **Install Git**:
   - Download from [git-scm.com](https://git-scm.com)
   - Select "Git from the command line and also from 3rd-party software"

2. **Verify Installation**:
   ```cmd
   git --version
   ```

---

## ⚙️ **Backend (Go) Problems**

### **Module/Dependency Issues**

**Problem**: `cannot find module` or `package not found`

**Solutions**:

1. **Initialize Go Module** (if missing):
   ```bash
   cd backend
   go mod init greact-bones/backend
   ```

2. **Download Dependencies**:
   ```bash
   go mod tidy
   go get github.com/gin-gonic/gin
   go get github.com/google/uuid
   ```

3. **Clear Module Cache**:
   ```bash
   go clean -modcache
   go mod download
   ```

4. **Check Go Version**:
   ```bash
   go version
   # Should be 1.21 or higher
   ```

### **Port Already in Use**

**Problem**: `bind: address already in use` on port 8080

**Solutions**:

1. **Find Process Using Port**:
   ```cmd
   netstat -ano | findstr :8080
   ```

2. **Kill Process** (replace PID with actual process ID):
   ```cmd
   taskkill /PID 1234 /F
   ```

3. **Change Port in Code**:
   ```go
   // In backend/cmd/api/main.go
   router.Run(":8081") // Change from :8080 to :8081
   ```

4. **Update Frontend API Base URL**:
   ```javascript
   // In frontend/src/services/userService.js
   const API_BASE = 'http://localhost:8081/api' // Update port
   ```

### **CORS Issues**

**Problem**: Browser shows CORS errors when frontend tries to call backend

**Solutions**:

1. **Verify CORS Middleware** in `backend/cmd/api/main.go`:
   ```go
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
   ```

2. **Check Request URLs**:
   - Ensure frontend is calling `http://localhost:8080/api/...`
   - Backend should be running on port 8080

3. **Use Production CORS Settings**:
   ```go
   // For production, replace "*" with specific domain
   c.Header("Access-Control-Allow-Origin", "https://yourdomain.com")
   ```

### **JSON Binding Errors**

**Problem**: `cannot bind JSON` or validation errors

**Solutions**:

1. **Check Request Structure**:
   ```javascript
   // Ensure frontend sends correct JSON
   const response = await axios.post('/api/users', {
       name: "John Doe",
       email: "john@example.com"
   })
   ```

2. **Verify Struct Tags**:
   ```go
   type CreateUserRequest struct {
       Name  string `json:"name" binding:"required,min=2,max=50"`
       Email string `json:"email" binding:"required,email"`
   }
   ```

3. **Add Validation Error Handling**:
   ```go
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(400, gin.H{
           "status": "error",
           "message": err.Error(),
       })
       return
   }
   ```

---

## 🎨 **Frontend (React) Problems**

### **Vite Server Won't Start**

**Problem**: `npm run dev` fails or shows errors

**Solutions**:

1. **Check Node Version**:
   ```bash
   node --version
   # Should be 18.0.0 or higher
   ```

2. **Clear Node Modules**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Port Conflicts**:
   ```bash
   # If port 5173 is busy, Vite will use next available port
   # Check terminal output for actual port
   ```

4. **Fix Permission Issues** (Linux/Mac):
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

### **Tailwind CSS Not Working**

**Problem**: Tailwind classes not applying styles

**Solutions**:

1. **Install Missing PostCSS Plugin**:
   ```bash
   cd frontend
   npm install @tailwindcss/postcss
   ```

2. **Check PostCSS Configuration** (`postcss.config.js`):
   ```javascript
   import tailwindcss from '@tailwindcss/postcss'
   import autoprefixer from 'autoprefixer'

   export default {
     plugins: [tailwindcss, autoprefixer],
   }
   ```

3. **Verify Tailwind Config** (`tailwind.config.js`):
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

4. **Check CSS Import** in `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### **React Query Issues**

**Problem**: `useQuery` not working or queries not updating

**Solutions**:

1. **Verify QueryClient Provider** in `main.jsx`:
   ```jsx
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

   const queryClient = new QueryClient()

   createRoot(document.getElementById('root')).render(
     <QueryClientProvider client={queryClient}>
       <App />
     </QueryClientProvider>
   )
   ```

2. **Check Query Key Format**:
   ```javascript
   // Use consistent query keys
   const { data } = useQuery({
     queryKey: ['users'], // Array format
     queryFn: userService.getUsers,
   })
   ```

3. **Install React Query DevTools**:
   ```bash
   npm install @tanstack/react-query-devtools
   ```
   
   ```jsx
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

   function App() {
     return (
       <>
         <YourApp />
         <ReactQueryDevtools initialIsOpen={false} />
       </>
     )
   }
   ```

### **Build Errors**

**Problem**: `npm run build` fails

**Solutions**:

1. **Fix Linting Errors**:
   ```bash
   npm run lint
   npm run lint -- --fix
   ```

2. **Check for Unused Imports**:
   ```javascript
   // Remove unused imports
   import { useState } from 'react' // Remove if not used
   ```

3. **Fix TypeScript Errors** (if using TypeScript):
   ```bash
   npx tsc --noEmit
   ```

4. **Clear Build Cache**:
   ```bash
   rm -rf dist
   npm run build
   ```

---

## 🌐 **API Communication Issues**

### **Network Errors**

**Problem**: `Network Error` or `Failed to fetch`

**Solutions**:

1. **Check Backend Status**:
   ```bash
   # Test backend directly
   curl http://localhost:8080/health
   ```

2. **Verify API Base URL**:
   ```javascript
   // In userService.js
   const API_BASE = 'http://localhost:8080/api' // Correct URL
   ```

3. **Check Browser Network Tab**:
   - Open Developer Tools → Network
   - Look for failed requests
   - Check request/response details

4. **Test with Postman/curl**:
   ```bash
   curl -X GET http://localhost:8080/api/users
   curl -X POST http://localhost:8080/api/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com"}'
   ```

### **CORS Errors**

**Problem**: `Access to fetch blocked by CORS policy`

**Solutions**:

1. **Ensure Backend CORS is Configured**:
   ```go
   // In main.go
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
   ```

2. **Check Request Headers**:
   ```javascript
   // Ensure content-type is set
   const response = await axios.post('/api/users', data, {
     headers: {
       'Content-Type': 'application/json'
     }
   })
   ```

### **Authentication Errors**

**Problem**: `401 Unauthorized` or `403 Forbidden`

**Solutions**:

1. **Check Authorization Header**:
   ```javascript
   // If using auth tokens
   const response = await axios.get('/api/users', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   ```

2. **Verify Token Format**:
   ```javascript
   // Check token in localStorage/cookies
   console.log('Token:', localStorage.getItem('token'))
   ```

---

## 🔄 **Development Workflow Issues**

### **Hot Reload Not Working**

**Problem**: Changes not reflecting in browser

**Solutions**:

1. **Check Vite Dev Server**:
   ```bash
   # Restart dev server
   npm run dev
   ```

2. **Clear Browser Cache**:
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser cache completely

3. **Check File Watch Limits** (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### **Database Connection Issues**

**Problem**: Database connection errors (when using a database)

**Solutions**:

1. **Check Connection String**:
   ```go
   // Example for PostgreSQL
   dsn := "host=localhost user=postgres password=password dbname=greact_bones port=5432 sslmode=disable"
   ```

2. **Verify Database is Running**:
   ```bash
   # For PostgreSQL
   pg_isready -h localhost -p 5432
   
   # For MySQL
   mysqladmin ping -h localhost -P 3306
   ```

3. **Check Firewall/Network**:
   ```bash
   telnet localhost 5432  # For PostgreSQL
   telnet localhost 3306  # For MySQL
   ```

---

## ⚡ **Performance Problems**

### **Slow API Responses**

**Problem**: API calls taking too long

**Solutions**:

1. **Add Request Timing**:
   ```go
   func timingMiddleware() gin.HandlerFunc {
       return gin.HandlerFunc(func(c *gin.Context) {
           start := time.Now()
           c.Next()
           latency := time.Since(start)
           log.Printf("Request took: %v", latency)
       })
   }
   ```

2. **Check Database Queries**:
   ```go
   // Add query logging
   db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
       Logger: logger.Default.LogMode(logger.Info),
   })
   ```

3. **Optimize React Query**:
   ```javascript
   const { data } = useQuery({
     queryKey: ['users'],
     queryFn: userService.getUsers,
     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   })
   ```

### **Large Bundle Size**

**Problem**: Frontend bundle too large

**Solutions**:

1. **Analyze Bundle**:
   ```bash
   npm run build
   npx vite-bundle-analyzer
   ```

2. **Implement Code Splitting**:
   ```jsx
   import { lazy } from 'react'
   
   const UserManagement = lazy(() => import('./UserManagement'))
   ```

3. **Remove Unused Dependencies**:
   ```bash
   npm audit
   npm uninstall unused-package
   ```

---

## 🚨 **Common Error Messages**

### **Backend Errors**

#### `panic: listen tcp :8080: bind: address already in use`
**Solution**: Change port or kill process using port 8080
```bash
lsof -ti:8080 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8080   # Windows
```

#### `no such file or directory: go.mod`
**Solution**: Initialize Go module
```bash
go mod init greact-bones/backend
```

#### `cannot find package`
**Solution**: Download dependencies
```bash
go mod tidy
go get -u ./...
```

### **Frontend Errors**

#### `Module not found: Can't resolve '@tanstack/react-query'`
**Solution**: Install missing dependency
```bash
npm install @tanstack/react-query
```

#### `PostCSS plugin @tailwindcss/postcss is not defined`
**Solution**: Install PostCSS plugin
```bash
npm install @tailwindcss/postcss
```

#### `Hydration failed because the initial UI does not match`
**Solution**: Check for client/server rendering differences
```jsx
// Use useEffect for client-only code
useEffect(() => {
  // Client-only code here
}, [])
```

---

## 🆘 **Getting More Help**

### **Debug Checklist**

Before asking for help, try these steps:

1. ✅ **Check the error message carefully**
2. ✅ **Restart both servers** (backend and frontend)
3. ✅ **Clear browser cache and cookies**
4. ✅ **Check browser console for errors**
5. ✅ **Verify all dependencies are installed**
6. ✅ **Test API endpoints with curl/Postman**
7. ✅ **Check network connectivity**

### **Providing Debug Information**

When asking for help, include:

1. **Error message** (full text)
2. **Steps to reproduce** the issue
3. **Environment details**:
   ```bash
   go version
   node --version
   npm --version
   ```
4. **Browser and version**
5. **Operating system**

### **Useful Commands for Debugging**

```bash
# Backend debugging
go version
go mod verify
go run -race cmd/api/main.go

# Frontend debugging  
node --version
npm --version
npm list
npm run build

# Network debugging
curl -v http://localhost:8080/api/health
netstat -an | grep 8080
ping localhost
```

---

## 🎯 **Quick Fixes Summary**

| Issue | Quick Fix |
|-------|-----------|
| Go not found | Use full path: `"C:\Program Files\Go\bin\go.exe"` |
| Port in use | Change port in main.go: `router.Run(":8081")` |
| CORS errors | Verify CORS middleware in backend |
| Tailwind not working | Install: `npm install @tailwindcss/postcss` |
| Hot reload broken | Restart dev server: `npm run dev` |
| Module not found | Run: `go mod tidy` or `npm install` |
| Build fails | Fix linting: `npm run lint -- --fix` |

---

Remember: Most issues are environment-related and can be solved by ensuring all dependencies are properly installed and configured. When in doubt, restart everything! 🔄 