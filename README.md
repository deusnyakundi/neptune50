# Neptune50 Project Management System

## Overview
Neptune50 is a comprehensive project management system designed for managing engineering projects, device provisioning, and team collaboration. The application features a modern React frontend with Material-UI and a Node.js/Express backend with PostgreSQL database.

## Table of Contents
1. [Architecture](#architecture)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Setup Instructions](#setup-instructions)
5. [Project Structure](#project-structure)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Authentication](#authentication)
9. [Development Guidelines](#development-guidelines)

## Architecture

### Frontend Architecture
The frontend follows a component-based architecture using React:
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Hooks**: Custom hooks for shared logic
- **Services**: API communication layer
- **Utils**: Helper functions and utilities

### Backend Architecture
The backend follows a layered architecture:
- **Routes**: API endpoint definitions
- **Controllers**: Request handling logic
- **Services**: Business logic
- **Models**: Database interactions
- **Middleware**: Request processing and authentication

## Features

### 1. User Management
- User authentication and authorization
- Role-based access control (Admin, Manager, Engineer)
- User profile management
- Password reset functionality

### 2. Project Management
- Create and manage projects
- Project status tracking
- Team assignment
- Project timeline management
- File attachments

### 3. Device Provisioning
- Device registration
- Bulk device provisioning
- Device status monitoring
- Configuration management

### 4. Reporting
- Custom report generation
- Data export functionality
- Analytics dashboard
- Performance metrics

### 5. Notifications
- Real-time notifications
- Email notifications
- System alerts
- User activity tracking

## Technology Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Query
- React Router
- Notistack
- Axios
- Recharts
- JWT Authentication

### Backend
- Node.js
- Express
- PostgreSQL
- Redis
- WebSocket
- JWT
- Bcrypt

### DevOps
- Docker
- Nginx
- PM2
- GitHub Actions

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- Redis
- Git

### Frontend Setup 