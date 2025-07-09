# 🚀 **Greact-Bones Deployment Guide**

> **Production deployment strategies for scalable, reliable applications**

This guide covers everything you need to deploy Greact-Bones applications to production environments, from simple single-server deployments to scalable cloud architectures.

## 📋 **Table of Contents**

- [Deployment Overview](#-deployment-overview)
- [Docker Deployment](#-docker-deployment)
- [Cloud Platform Deployment](#-cloud-platform-deployment)
- [Database Setup](#-database-setup)
- [Environment Configuration](#-environment-configuration)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Monitoring & Logging](#-monitoring--logging)
- [Security Hardening](#-security-hardening)

---

## 🎯 **Deployment Overview**

### **Deployment Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Reverse Proxy │    │    Database     │
│   (CloudFlare)  │────│     (Nginx)     │────│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                       ┌───────┴───────┐
                       │               │
                ┌──────▼──────┐ ┌──────▼──────┐
                │   Frontend  │ │   Backend   │
                │  (React)    │ │    (Go)     │
                │  Port 3000  │ │  Port 8080  │
                └─────────────┘ └─────────────┘
```

### **Deployment Options**

| Method | Complexity | Cost | Scalability | Best For |
|--------|------------|------|-------------|----------|
| **Single VPS** | Low | Low | Limited | MVP, Small Apps |
| **Docker Compose** | Medium | Medium | Medium | Medium Apps |
| **Kubernetes** | High | High | High | Large Apps |
| **Platform-as-a-Service** | Low | Medium | High | Rapid Deployment |

---

## 🐳 **Docker Deployment**

### **Creating Dockerfiles**

#### **Backend Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/api/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]
```

#### **Frontend Dockerfile**

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### **Nginx Configuration**

Create `frontend/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:8080/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
}
```

### **Docker Compose Setup**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Database
  database:
    image: postgres:15-alpine
    container_name: greact-db
    environment:
      POSTGRES_DB: greact_bones
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - greact-network

  # Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: greact-backend
    environment:
      PORT: 8080
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@database:5432/greact_bones?sslmode=disable
      JWT_SECRET: ${JWT_SECRET}
      ENVIRONMENT: production
    ports:
      - "8080:8080"
    depends_on:
      - database
    networks:
      - greact-network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: greact-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - greact-network
    restart: unless-stopped

  # Redis (optional - for caching)
  redis:
    image: redis:7-alpine
    container_name: greact-redis
    ports:
      - "6379:6379"
    networks:
      - greact-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  greact-network:
    driver: bridge
```

### **Environment Variables**

Create `.env`:

```env
# Database
DB_PASSWORD=your_secure_password_here

# Backend
JWT_SECRET=your_jwt_secret_here_make_it_long_and_random
ENVIRONMENT=production

# Optional
REDIS_URL=redis://redis:6379
```

### **Deployment Commands**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Scale backend (if needed)
docker-compose up -d --scale backend=3
```

---

## ☁️ **Cloud Platform Deployment**

### **Heroku Deployment**

#### **Backend Setup**

Create `backend/Procfile`:
```
web: ./main
```

Create `backend/heroku.yml`:
```yaml
build:
  docker:
    web: Dockerfile
```

#### **Frontend Setup**

Create `frontend/package.json` script:
```json
{
  "scripts": {
    "build": "vite build",
    "start": "npm run preview"
  }
}
```

#### **Deployment Steps**

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create applications
heroku create your-app-backend
heroku create your-app-frontend

# Set environment variables
heroku config:set JWT_SECRET=your_secret -a your-app-backend
heroku config:set DATABASE_URL=postgres://... -a your-app-backend

# Deploy backend
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-backend
git push heroku main

# Deploy frontend
cd ../frontend
# Update API base URL in code to point to Heroku backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-frontend
git push heroku main
```

### **AWS Deployment**

#### **Using AWS Elastic Beanstalk**

Create `backend/Dockerrun.aws.json`:
```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "your-account.dkr.ecr.region.amazonaws.com/greact-backend:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8080"
    }
  ]
}
```

#### **Using AWS ECS**

Create `task-definition.json`:
```json
{
  "family": "greact-bones",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/greact-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgres://..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/greact-bones",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### **DigitalOcean App Platform**

Create `.do/app.yaml`:
```yaml
name: greact-bones
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/greact-bones
    branch: main
  run_command: ./main
  environment_slug: go
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/greact-bones
    branch: main
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: db
  engine: PG
  version: "13"
  size: db-s-dev-database
```

---

## 🗄️ **Database Setup**

### **PostgreSQL Production Setup**

#### **Database Configuration**

```sql
-- scripts/init.sql
CREATE DATABASE greact_bones;

-- Create application user
CREATE USER greact_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE greact_bones TO greact_app;

-- Connect to database
\c greact_bones

-- Create tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### **Connection Pool Configuration**

```go
// backend/internal/data/database.go
package data

import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "time"
)

func InitDB(dsn string) (*gorm.DB, error) {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, err
    }

    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }

    // Configure connection pool
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)

    return db, nil
}
```

### **Database Migrations**

Create `backend/scripts/migrations/`:

```sql
-- 001_create_users_table.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 001_create_users_table.down.sql
DROP TABLE users;
```

Migration runner:
```go
// backend/cmd/migrate/main.go
package main

import (
    "database/sql"
    "github.com/golang-migrate/migrate/v4"
    "github.com/golang-migrate/migrate/v4/database/postgres"
    _ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
    db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal(err)
    }

    driver, err := postgres.WithInstance(db, &postgres.Config{})
    if err != nil {
        log.Fatal(err)
    }

    m, err := migrate.NewWithDatabaseInstance(
        "file://scripts/migrations",
        "postgres", driver)
    if err != nil {
        log.Fatal(err)
    }

    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        log.Fatal(err)
    }
}
```

---

## ⚙️ **Environment Configuration**

### **Production Environment Variables**

Create `production.env`:

```env
# Application
ENVIRONMENT=production
PORT=8080
HOST=0.0.0.0

# Database
DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=require

# Security
JWT_SECRET=your_256_bit_secret_key_here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# External Services
REDIS_URL=redis://redis:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### **Configuration Management**

```go
// backend/internal/config/config.go
package config

import (
    "os"
    "strconv"
    "strings"
)

type Config struct {
    Environment string
    Port        string
    Host        string
    
    DatabaseURL string
    
    JWTSecret   string
    CORSOrigins []string
    
    RedisURL    string
    
    LogLevel    string
    SentryDSN   string
}

func Load() *Config {
    corsOrigins := strings.Split(os.Getenv("CORS_ORIGINS"), ",")
    if len(corsOrigins) == 1 && corsOrigins[0] == "" {
        corsOrigins = []string{"*"}
    }

    return &Config{
        Environment: getEnv("ENVIRONMENT", "development"),
        Port:        getEnv("PORT", "8080"),
        Host:        getEnv("HOST", "localhost"),
        
        DatabaseURL: getEnv("DATABASE_URL", ""),
        
        JWTSecret:   getEnv("JWT_SECRET", ""),
        CORSOrigins: corsOrigins,
        
        RedisURL: getEnv("REDIS_URL", ""),
        
        LogLevel:  getEnv("LOG_LEVEL", "info"),
        SentryDSN: getEnv("SENTRY_DSN", ""),
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

## 🔄 **CI/CD Pipeline**

### **GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Go
      uses: actions/setup-go@v3
      with:
        go-version: 1.21
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
    
    - name: Test Backend
      run: |
        cd backend
        go mod tidy
        go test ./...
    
    - name: Test Frontend
      run: |
        cd frontend
        npm ci
        npm run lint
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push backend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: greact-backend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd backend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Build and push frontend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: greact-frontend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd frontend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster greact-cluster --service greact-service --force-new-deployment
```

### **Deployment Script**

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Starting deployment..."

# Build and tag images
docker build -t greact-backend:latest backend/
docker build -t greact-frontend:latest frontend/

# Tag for registry
docker tag greact-backend:latest your-registry/greact-backend:latest
docker tag greact-frontend:latest your-registry/greact-frontend:latest

# Push to registry
docker push your-registry/greact-backend:latest
docker push your-registry/greact-frontend:latest

# Deploy to production
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

echo "Deployment completed successfully!"
```

---

## 📊 **Monitoring & Logging**

### **Application Logging**

```go
// backend/internal/logger/logger.go
package logger

import (
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

func NewLogger(level string) (*zap.Logger, error) {
    config := zap.NewProductionConfig()
    
    switch level {
    case "debug":
        config.Level = zap.NewAtomicLevelAt(zapcore.DebugLevel)
    case "info":
        config.Level = zap.NewAtomicLevelAt(zapcore.InfoLevel)
    case "warn":
        config.Level = zap.NewAtomicLevelAt(zapcore.WarnLevel)
    case "error":
        config.Level = zap.NewAtomicLevelAt(zapcore.ErrorLevel)
    }
    
    return config.Build()
}

// Usage in handlers
func (h *UserHandlers) CreateUser(c *gin.Context) {
    logger := h.logger.With(
        zap.String("method", c.Request.Method),
        zap.String("path", c.Request.URL.Path),
        zap.String("ip", c.ClientIP()),
    )
    
    logger.Info("Creating user")
    
    // ... handler logic
    
    logger.Info("User created successfully", zap.String("user_id", user.ID))
}
```

### **Health Checks**

```go
// backend/internal/api/health.go
package api

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

type HealthHandlers struct {
    db *gorm.DB
}

func NewHealthHandlers(db *gorm.DB) *HealthHandlers {
    return &HealthHandlers{db: db}
}

func (h *HealthHandlers) HealthCheck(c *gin.Context) {
    health := map[string]interface{}{
        "status": "ok",
        "timestamp": time.Now(),
    }
    
    // Check database connection
    if sqlDB, err := h.db.DB(); err == nil {
        if err := sqlDB.Ping(); err != nil {
            health["database"] = "unhealthy"
            health["status"] = "degraded"
        } else {
            health["database"] = "healthy"
        }
    }
    
    statusCode := http.StatusOK
    if health["status"] == "degraded" {
        statusCode = http.StatusServiceUnavailable
    }
    
    c.JSON(statusCode, health)
}

func (h *HealthHandlers) ReadinessCheck(c *gin.Context) {
    // Check if app is ready to receive traffic
    c.JSON(http.StatusOK, gin.H{
        "status": "ready",
        "timestamp": time.Now(),
    })
}
```

### **Prometheus Metrics**

```go
// backend/internal/metrics/metrics.go
package metrics

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    RequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "path", "status"},
    )
    
    RequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "Duration of HTTP requests",
        },
        []string{"method", "path"},
    )
)

// Middleware
func PrometheusMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        start := time.Now()
        
        c.Next()
        
        duration := time.Since(start).Seconds()
        RequestDuration.WithLabelValues(c.Request.Method, c.Request.URL.Path).Observe(duration)
        RequestsTotal.WithLabelValues(c.Request.Method, c.Request.URL.Path, string(c.Writer.Status())).Inc()
    })
}
```

---

## 🔒 **Security Hardening**

### **HTTPS Configuration**

```nginx
# nginx.conf for production
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/yourdomain.com.pem;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Security Middleware**

```go
// backend/internal/middleware/security.go
package middleware

import (
    "github.com/gin-gonic/gin"
)

func SecurityHeaders() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("X-Frame-Options", "DENY")
        c.Header("X-Content-Type-Options", "nosniff")
        c.Header("X-XSS-Protection", "1; mode=block")
        c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
        c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        
        c.Next()
    }
}

func RateLimiting() gin.HandlerFunc {
    // Implementation depends on your rate limiting strategy
    // Consider using github.com/ulule/limiter or similar
    return func(c *gin.Context) {
        // Rate limiting logic
        c.Next()
    }
}
```

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Monitoring setup configured
- [ ] Backup strategy implemented

### **Deployment Process**

- [ ] Deploy to staging environment first
- [ ] Run integration tests
- [ ] Perform database migrations
- [ ] Deploy backend services
- [ ] Deploy frontend application
- [ ] Verify health checks
- [ ] Monitor error rates and performance

### **Post-Deployment**

- [ ] Verify all endpoints working
- [ ] Check logs for errors
- [ ] Monitor performance metrics
- [ ] Test critical user flows
- [ ] Set up alerts and notifications

---

This deployment guide provides a solid foundation for taking your Greact-Bones application from development to production. Choose the deployment strategy that best fits your needs, starting simple and scaling up as your application grows. 🚀 