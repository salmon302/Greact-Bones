# **Greact-Bones: A Full-Stack Go + React Skeleton Project**

Welcome to Greact-Bones! This project is a production-ready skeleton for building modern, full-stack web applications using Golang and React. It is designed to be a flexible, well-documented, and high-performance starting point for educational purposes, new projects, and proof-of-concepts.

This skeleton is built upon the extensive research found in [`docs/RESEARCH.md`](docs/RESEARCH.md), which analyzes best practices for a Go and React stack. We have made specific technological choices to provide a "golden path" for a great developer experience, but have also included documentation on how to adapt and customize the stack to your needs.

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

### **Next Steps**

- **Add Authentication:** Implement JWT-based auth with protected routes
- **Database Integration:** Connect to PostgreSQL or your preferred database
- **State Management:** Use Zustand stores for complex client state
- **API Integration:** Use TanStack Query for server state management
- **Testing:** Add unit and integration tests for both backend and frontend
- **Deployment:** Use Docker for containerized deployments
