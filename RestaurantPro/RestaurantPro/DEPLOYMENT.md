# RestaurantPro Deployment Guide

This guide explains how to deploy the RestaurantPro application with backend on Render and frontend on Vercel.

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Git repository with this code

## Backend Deployment (Render)

1. **Push code to GitHub**
   - Create a new repository on GitHub
   - Push the `RestaurantPro` folder to the repository

2. **Deploy on Render**
   - Go to https://dashboard.render.com
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file and configure the service
   - Set environment variables:
     - `DATABASE_URL`: Your production database URL (e.g., PostgreSQL on Render or external)
     - `CORS_ORIGINS`: Your Vercel frontend URL (set after frontend deployment)

3. **Database Setup**
   - For production, use a managed database like Render's PostgreSQL or AWS RDS
   - Update `DATABASE_URL` in Render environment variables
   - Run database migrations if needed

## Frontend Deployment (Vercel)

1. **Deploy on Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." and select "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Create React App
     - Root Directory: `frontend-web-dashboard`
     - Build Command: `npm run build`
     - Output Directory: `build`

2. **Set Environment Variables**
   - In Vercel dashboard, go to your project settings
   - Add environment variable:
     - Name: `REACT_APP_API_BASE`
     - Value: Your Render backend URL (e.g., `https://restaurantpro-backend.onrender.com`)

## Post-Deployment Configuration

1. **Update CORS on Backend**
   - In Render dashboard, update `CORS_ORIGINS` environment variable
   - Set it to your Vercel domain (e.g., `https://restaurantpro.vercel.app`)

2. **Test the Application**
   - Frontend: Access your Vercel URL
   - Backend API: Check `https://your-render-url/health`
   - Login with default credentials: admin/admin123

## Environment Variables Summary

### Backend (Render)
- `DATABASE_URL`: Production database connection string
- `CORS_ORIGINS`: Comma-separated list of allowed frontend URLs

### Frontend (Vercel)
- `REACT_APP_API_BASE`: Backend API base URL

## Notes

- The application uses SQLite for local development. For production, switch to PostgreSQL.
- WebSocket connections are supported on Render.
- Make sure to update CORS settings after both deployments are complete.
- Default admin credentials: username: `admin`, password: `admin123`
