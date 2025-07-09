# 🦴 **Greact-Bones: A Full-Stack Go + React Skeleton Project**

[![Go Version](https://img.shields.io/badge/Go-1.21+-blue.svg)](https://golang.org)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-7.0+-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC.svg)](https://tailwindcss.com)

> **A production-ready, educational skeleton for building modern full-stack web applications**

Welcome to **Greact-Bones**! This project provides a carefully crafted foundation for building scalable, maintainable web applications using **Golang** and **React**. Designed with education and production-readiness in mind, it serves as both a learning resource and a robust starting point for your next project.

## 🎯 **Why Greact-Bones?**

- **📚 Educational First**: Comprehensive documentation explaining *why* and *how* each technology choice was made
- **🚀 Production Ready**: Battle-tested patterns and best practices baked in from day one
- **⚡ Modern Stack**: Latest versions of Go, React, and supporting technologies
- **🔧 Developer Experience**: Optimized tooling and workflows for maximum productivity
- **📖 Extensive Documentation**: Deep-dive guides, tutorials, and architectural explanations

This skeleton is built upon extensive research found in [`docs/RESEARCH.md`](docs/RESEARCH.md), which analyzes industry best practices for Go and React stacks. We provide a "golden path" for great developer experience while including guidance on customization and adaptation.

## **Core Technologies**

This project provides a pre-configured, modern technology stack:

| Area                  | Technology                                                                                                                              | Why?                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Backend**           | [**Go**](https://golang.org/) with [**Gin**](https://gin-gonic.com/)                                                                     | For building high-performance, compiled, and scalable APIs with a rich ecosystem of middleware.                         |
| **Frontend**          | [**React**](https://reactjs.org/) with [**Vite**](https://vitejs.dev/)                                                                    | For a fast, modern, and component-based UI with an exceptional development experience and build toolchain.              |
| **API Communication** | [**REST**](https://en.wikipedia.org/wiki/Representational_state_transfer)                                                               | The industry standard for stateless, cacheable, and scalable web APIs.                                                  |
| **Styling**           | [**Tailwind CSS**](https://tailwindcss.com/)                                                                                            | A utility-first CSS framework for rapid, custom UI development without leaving your HTML.                               |
| **Server State**      | [**TanStack Query**](https://tanstack.com/query/latest) (React Query)                                                                   | For declarative, automatic, and resilient management of server state, eliminating complex data-fetching logic.        |
| **Client State**      | [**Zustand**](https://github.com/pmndrs/zustand)                                                                                        | A minimal, fast, and scalable state management solution for client-side state that is simple and un-opinionated.      |
| **Deployment**        | [**Docker**](https://www.docker.com/)                                                                                                   | For containerizing the application into a single, portable, and self-contained monolith using a multi-stage build.    |
| **API Docs**          | [**Swagger/OpenAPI**](https://swagger.io/)                                                                                              | For automatically generating interactive API documentation directly from the Go source code.                          |

---

## **Project Structure**

The project is organized into two main parts:

```
/
├── backend/    # The Golang Gin API
├── frontend/   # The React + Vite client application
├── docs/       # Supporting documentation and research
└── README.md   # This development guide
```

-   `backend/`: Contains the Go application. It follows the standard Go project layout (`cmd`, `internal`, etc.).
-   `frontend/`: Contains the React application, structured to scale with components, hooks, and services.

---
## **Getting Started**

### **Prerequisites**

Before you begin, ensure you have the following installed:
- [**Go**](https://go.dev/doc/install) (version 1.21 or later)
- [**Node.js**](https://nodejs.org/en/download/) (version 18 or later)
- [**Docker**](https://docs.docker.com/get-docker/) (for building production images)

### **Quick Start**

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd greact-bones
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   go mod tidy                    # Download Go dependencies
   go get github.com/gin-gonic/gin  # Install Gin framework
   go run cmd/api/main.go         # Start the API server
   ```
   The backend API will be available at `http://localhost:8080`

3. **Setup the Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install                    # Install all dependencies
   npm run dev                    # Start the development server
   ```
   The frontend application will be available at `http://localhost:5173`

### **Development Workflow**

#### **Backend Development**
- **Start the server:** `cd backend && go run cmd/api/main.go`
- **Test API endpoints:**
  - Health check: `GET http://localhost:8080/health`
  - Hello endpoint: `GET http://localhost:8080/api/hello`
- **Add new routes:** Edit `backend/cmd/api/main.go` or create new handlers in `backend/internal/`

#### **Frontend Development**
- **Start development server:** `cd frontend && npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Lint code:** `npm run lint`

#### **Available Scripts**
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| **Backend Commands** | |
| `go run cmd/api/main.go` | Start Go API server |
| `go mod tidy` | Clean up and download Go dependencies |

### **Testing the Full Stack**

1. Start both servers (backend on :8080, frontend on :5173)
2. Open `http://localhost:5173` in your browser
3. Click "Test API Connection" to verify the frontend can communicate with the backend
4. You should see a JSON response from the Go API

### **Project Structure Deep Dive**

```
backend/
├── cmd/api/main.go          # Application entry point
├── internal/               # Private application code
│   ├── api/               # API handlers and routes
│   └── domain/            # Business logic and models
├── pkg/                   # Public packages
└── go.mod                 # Go module definition

frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API communication logic
│   ├── stores/            # Zustand state stores
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── public/                # Static assets
├── package.json           # Node.js dependencies
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🚨 **Troubleshooting**

### **Go Command Not Recognized**
If you see `'go' is not recognized as an internal or external command`:

1. **Verify Installation**: Check if Go is installed: `dir "C:\Program Files (x86)\Go\bin"`
2. **Environment Variables**: Ensure these paths are in your system PATH:
   - `C:\Program Files (x86)\Go\bin`
   - `C:\Program Files (x86)\Go`
3. **Refresh Terminal**: Close and reopen your terminal, or run `refreshenv` (if available)
4. **Use Full Path**: As a workaround, use the full path:
   ```bash
   "C:\Program Files (x86)\Go\bin\go.exe" version
   ```
5. **Batch File**: Use the provided `backend/start-server.bat` file

### **Frontend Issues**
- **Tailwind CSS not working**: Ensure `@tailwindcss/postcss` is installed and `postcss.config.js` is configured
- **Port conflicts**: If port 5173 is busy, Vite will automatically use the next available port
- **CORS errors**: Ensure the backend server is running and CORS is properly configured

### **Backend Issues**
- **Port 8080 busy**: Change the port in `backend/cmd/api/main.go` (line: `router.Run(":8080")`)
- **Module errors**: Run `go mod tidy` in the backend directory
- **Gin import errors**: Run `go get github.com/gin-gonic/gin`

## 📚 **Documentation & Learning Resources**

### **Core Documentation**
- **[📋 Architecture Guide](docs/ARCHITECTURE.md)** - Deep dive into system design and patterns
- **[🎓 Tutorial](docs/TUTORIAL.md)** - Step-by-step beginner-friendly guide  
- **[⚡ Best Practices](docs/BEST-PRACTICES.md)** - Recommended patterns and conventions
- **[🔧 Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[🚀 Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment strategies

### **Research & Background**
- **[📖 Research Document](docs/RESEARCH.md)** - Comprehensive analysis of technology choices and best practices

## 🎯 **Next Steps & Extension Ideas**

### **Authentication & Security**
```bash
# Add JWT-based authentication
# Implement protected routes
# Add role-based access control (RBAC)
```

### **Database Integration**
```bash
# PostgreSQL with GORM
go get gorm.io/gorm gorm.io/driver/postgres

# MySQL alternative
go get gorm.io/driver/mysql

# SQLite for development
go get gorm.io/driver/sqlite
```

### **Advanced Frontend Features**
```bash
# Add routing
npm install react-router-dom

# Add form handling
npm install react-hook-form

# Add UI components
npm install @mui/material @emotion/react @emotion/styled
```

### **Testing & Quality**
```bash
# Backend testing
go get github.com/stretchr/testify

# Frontend testing
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### **Production Enhancements**
- **Logging**: Structured logging with Zap or Zerolog
- **Monitoring**: Prometheus metrics and Grafana dashboards  
- **Caching**: Redis for session storage and caching
- **Message Queues**: RabbitMQ or Apache Kafka for async processing
- **API Documentation**: Swagger/OpenAPI integration
- **Docker**: Multi-stage builds for production deployment

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
