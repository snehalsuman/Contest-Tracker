# Contest Tracker - Complete Project Explanation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Testing Strategy](#testing-strategy)
11. [Deployment](#deployment)
12. [Key Components Explained](#key-components-explained)

---

## 🎯 Project Overview

**Contest Tracker** is a full-stack web application that helps developers track coding contests from popular platforms like LeetCode, Codeforces, and CodeChef. It provides a centralized place to view upcoming contests, bookmark favorites, and access solution videos for past contests.

### Problem Statement
- Developers need to check multiple platforms separately for contests
- No centralized system to track contest schedules
- Hard to find solution videos for past contests
- No easy way to bookmark and organize contests

### Solution
A MERN stack application that:
- Aggregates contests from multiple platforms
- Provides a unified interface for viewing contests
- Automatically fetches solution videos from YouTube
- Allows users to bookmark contests
- Shows today's contests at a glance

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │
│   (Express.js)  │
│   Port: 5001    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────────┐
│ MongoDB│ │ External  │
│        │ │ APIs      │
│ Port:  │ │           │
│ 27017  │ │ - LeetCode│
└────────┘ │ - Codeforces
           │ - CodeChef
           │ - YouTube
           └───────────┘
```

### Architecture Type: **3-Tier Architecture**
1. **Presentation Layer**: React Frontend
2. **Application Layer**: Express.js Backend
3. **Data Layer**: MongoDB Database

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: UI library for building interactive components
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Radix UI**: Accessible UI components
- **Lucide React**: Icon library
- **Axios**: HTTP client for API calls
- **Sonner**: Toast notification library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **Axios**: HTTP client for external APIs
- **Node-cron**: Task scheduler for automated jobs
- **Google APIs**: YouTube Data API for solution videos
- **Cheerio**: Web scraping (if needed)
- **Puppeteer**: Browser automation (if needed)

### DevOps & Tools
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Jenkins**: CI/CD pipeline
- **Jest**: Backend testing framework
- **Vitest**: Frontend testing framework
- **Selenium**: End-to-end testing

---

## ✨ Features

### 1. **Contest Aggregation**
- Fetches contests from 3 platforms:
  - **LeetCode**: Using GraphQL API
  - **Codeforces**: Using REST API
  - **CodeChef**: Using REST API
- Shows both upcoming and past contests

### 2. **Today's Contests**
- Dedicated page showing contests happening today
- Client-side filtering for accurate timezone handling

### 3. **Bookmarking System**
- Save favorite contests using browser localStorage
- Access bookmarked contests from dedicated page
- Persistent across sessions (browser-based)

### 4. **Solution Videos**
- Automatically matches YouTube videos to past contests
- Uses YouTube Data API to fetch videos from curated playlists
- Smart matching algorithm based on contest title and platform
- Users can also manually submit solution links

### 5. **Filtering & Search**
- Filter by platform (LeetCode, Codeforces, CodeChef)
- Toggle between upcoming and past contests
- Sort by start time

### 6. **Dark Mode**
- System preference detection
- Manual toggle option
- Persistent theme selection

### 7. **Responsive Design**
- Mobile-first approach
- Works on all screen sizes
- Modern, clean UI

---

## 🔧 Backend Architecture

### File Structure
```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   └── Contest.js         # Contest data model
├── routes/
│   └── contestRoutes.js   # API route handlers
├── utils/
│   ├── fetchContests.js           # Main aggregator
│   ├── fetchLeetCodeContests.js   # LeetCode fetcher
│   ├── fetchCodeforcesContests.js # Codeforces fetcher
│   ├── fetchCodeChefContests.js   # CodeChef fetcher
│   └── youtubeScraper.js          # YouTube solution matcher
├── tests/                 # Test files
└── server.js             # Main server file
```

### Key Backend Components

#### 1. **Server Setup (server.js)**
- Express server configuration
- CORS middleware for frontend communication
- MongoDB connection
- Cron jobs for automated tasks:
  - **Daily at 10 PM**: Fetch contests and solutions
  - **Every 6 hours**: Refresh contest data
  - **Every 14 minutes**: Health check ping (prevents server sleep)

#### 2. **Contest Model (models/Contest.js)**
```javascript
{
  title: String (required),
  platform: String (required), // "LeetCode", "Codeforces", "CodeChef"
  start_time: Date,
  duration: Number (minutes),
  url: String (required),
  past: Boolean (default: false),
  solution_link: String (optional)
}
```

#### 3. **API Routes (routes/contestRoutes.js)**
- `GET /api/contests` - Get all contests with filtering
- `GET /api/contests/fetch` - Manually trigger contest fetch
- `GET /api/contests/today` - Get today's contests
- `POST /api/contests/solution/:id` - Add solution link

#### 4. **Contest Fetchers**

**LeetCode (fetchLeetCodeContests.js)**
- Uses GraphQL API
- Fetches from `https://leetcode.com/graphql`
- Extracts: title, startTime, duration, titleSlug
- Returns upcoming + last 20 past contests

**Codeforces (fetchCodeforcesContests.js)**
- Uses REST API: `https://codeforces.com/api/contest.list`
- Filters by phase: "BEFORE" (upcoming), "FINISHED" (past)
- Returns upcoming + last 20 past contests

**CodeChef (fetchCodeChefContests.js)**
- Uses REST API: `https://www.codechef.com/api/list/contests/all`
- Separates future_contests and past_contests
- Returns upcoming + last 20 past contests

#### 5. **YouTube Solution Matcher (youtubeScraper.js)**
- Fetches videos from curated YouTube playlists
- Uses Google YouTube Data API v3
- Smart title matching algorithm:
  - **LeetCode**: Matches "Weekly Contest 123" or "Biweekly Contest 45"
  - **Codeforces**: Matches "Codeforces Round 123 Div 2"
  - **CodeChef**: Matches "Starters 123" or "Cookoff 45"
- Updates database with solution links automatically
- Runs every 6 hours via cron job

### Automated Tasks (Cron Jobs)

1. **Contest Fetching** (Every 6 hours)
   - Fetches latest contests from all platforms
   - Updates database with new/updated contests
   - Marks past contests automatically

2. **Solution Matching** (Daily at 10 PM)
   - Checks past contests without solutions
   - Matches YouTube videos from playlists
   - Updates contest records with solution links

3. **Health Check** (Every 14 minutes)
   - Pings `/api/health` endpoint
   - Prevents cloud servers from sleeping
   - Ensures 24/7 availability

---

## 🎨 Frontend Architecture

### File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── ContestList.jsx  # Main contest display
│   │   ├── BookmarkedContests.jsx
│   │   ├── MainNav.jsx      # Navigation bar
│   │   ├── ModeToggle.jsx   # Dark mode toggle
│   │   └── SubmitSolutionForm.jsx
│   ├── pages/
│   │   ├── Home.jsx         # Main page
│   │   ├── Bookmarks.jsx    # Bookmarked contests
│   │   ├── TodaysContests.jsx
│   │   └── SubmitSolution.jsx
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── hooks/
│   │   └── use-toast.jsx    # Toast notifications
│   ├── lib/
│   │   └── utils.js         # Utility functions
│   └── App.jsx              # Main app component
└── public/                  # Static assets
```

### Key Frontend Components

#### 1. **App.jsx** - Main Application Component
- Sets up React Router
- Implements theme provider (dark mode)
- Defines routes:
  - `/` - Home page
  - `/bookmarks` - Bookmarked contests
  - `/todays-contests` - Today's contests
  - `/submit-solution` - Submit solution form
- Includes navigation and footer

#### 2. **ContestList.jsx** - Contest Display Component
- Fetches and displays contests
- Platform filtering (dropdown)
- Past/Upcoming toggle (tabs)
- Contest cards with:
  - Title, platform badge, duration
  - Start time
  - Visit link, Solution link (if available)
  - Bookmark button
- Loading states (skeletons)
- Empty states

#### 3. **API Service (services/api.js)**
- Centralized API communication
- Functions:
  - `fetchContests(platform, past)` - Get filtered contests
  - `fetchTodaysContests()` - Get today's contests
  - `fetchBookmarkedContests()` - Get bookmarked contests
  - `toggleBookmark(id)` - Toggle bookmark (localStorage)
  - `addSolutionLink(id, link)` - Submit solution link

#### 4. **Bookmarking System**
- Uses browser localStorage
- Stores array of contest IDs
- Client-side only (no backend storage)
- Persistent across sessions

#### 5. **Theme System**
- Uses `theme-provider.jsx` component
- Supports: light, dark, system
- Stores preference in localStorage
- TailwindCSS dark mode classes

---

## 📊 Database Schema

### Contest Collection

```javascript
{
  _id: ObjectId (auto-generated),
  title: String,              // Contest name
  platform: String,           // "LeetCode" | "Codeforces" | "CodeChef"
  start_time: Date,           // Contest start time
  duration: Number,           // Duration in minutes
  url: String,                // Contest URL
  past: Boolean,              // true if contest has ended
  solution_link: String       // YouTube solution link (optional)
}
```

### Indexes
- `{ title: 1, platform: 1 }` - Unique compound index for upsert operations

### Operations
- **Upsert**: Updates existing contests or creates new ones
- **Query**: Filter by platform, past status, date range
- **Update**: Mark contests as past, add solution links

---

## 🌐 API Endpoints

### Base URL
- Development: `http://localhost:5001/api`
- Production: `/api` (relative path)

### Endpoints

#### 1. **Health Check**
```
GET /api/health
Response: { status: 'ok', message: 'Server is running' }
```

#### 2. **Get Contests**
```
GET /api/contests?platform={platform}&past={true|false}
Query Parameters:
  - platform (optional): "LeetCode" | "Codeforces" | "CodeChef"
  - past (optional): "true" | "false"
Response: Array of contest objects
```

#### 3. **Get Today's Contests**
```
GET /api/contests/today
Response: Array of contests happening today
```

#### 4. **Fetch Contests (Manual)**
```
GET /api/contests/fetch
Response: { message: "Contests fetched and stored successfully!" }
```

#### 5. **Add Solution Link**
```
POST /api/contests/solution/:id
Body: { solution_link: "https://youtube.com/..." }
Response: { message: "Solution link updated", solution_link: "..." }
```

---

## 🚀 CI/CD Pipeline

### Jenkins Pipeline (Jenkinsfile)

#### Stages:

1. **Checkout Code**
   - Clones repository from GitHub

2. **Install & Test**
   - Installs dependencies for frontend and backend
   - Runs tests (Jest for backend, Vitest for frontend)
   - Continues even if tests fail (development mode)

3. **Build Docker Image**
   - Builds Docker image with tag: `v{BUILD_NUMBER}`
   - Multi-stage build for optimization

4. **Push Docker Image**
   - Logs into Docker Hub
   - Tags image as `latest` and `v{BUILD_NUMBER}`
   - Pushes to Docker Hub

5. **Deploy Backend to Render**
   - Triggers Render deployment via API
   - Uses Render API key from credentials

6. **Deploy Frontend to Vercel**
   - Triggers Vercel deployment via API
   - Uses Vercel token from credentials

7. **Deploy Locally**
   - Stops existing container
   - Runs new container with environment variables
   - Maps port 3030 to container port 5000

### Credentials Required
- `dockerhub-creds` - Docker Hub username/password
- `youtube-api-key` - YouTube Data API key
- `mongodb-uri` - MongoDB connection string
- `render-api-key` - Render deployment API key
- `vercel-token` - Vercel deployment token

---

## 🧪 Testing Strategy

### Backend Testing (Jest)

#### Test Files:
- `models/Contest.test.js` - Contest model tests
- `routes/contestRoutes.test.js` - API endpoint tests
- `routes/healthCheck.test.js` - Health check tests
- `utils/fetchContests.test.js` - Contest fetching tests
- `utils/fetchLeetCodeContests.test.js` - LeetCode fetcher tests
- `utils/youtubeScraper.test.js` - YouTube scraper tests
- `utils/cronJobs.test.js` - Cron job tests

#### Test Coverage:
- Unit tests for utility functions
- Integration tests for API endpoints
- Mock external APIs (axios, mongoose)
- Use MongoDB Memory Server for database tests

### Frontend Testing (Vitest)

#### Test Files:
- Component tests (React Testing Library)
- Unit tests for utilities
- Integration tests for API services

#### Selenium Tests:
- `basic-test.js` - Basic functionality
- `navigation-test.js` - Navigation tests
- `contests-test.js` - Contest display tests

### Postman Collection
- Manual API testing
- Environment variables for different environments
- All endpoints covered

---

## 🐳 Deployment

### Docker Setup

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Frontend Dockerfile (Multi-stage)
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
services:
  backend:
    build: ./backend
    ports: ["5001:5000"]
    environment:
      - MONGO_URI=mongodb://mongo:27017/contest-tracker
      - PORT=5000
    depends_on: [mongo]

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]

  mongo:
    image: mongo:6
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
```

### Deployment Platforms

1. **Backend**: Render.com
   - Automatic deployments from Git
   - Environment variables configured
   - Health checks enabled

2. **Frontend**: Vercel
   - Automatic deployments from Git
   - Fast CDN delivery
   - Serverless functions support

3. **Database**: MongoDB Atlas (cloud) or local MongoDB

---

## 🔑 Key Components Explained

### 1. **Contest Aggregation Flow**

```
1. Cron Job Triggers (Every 6 hours)
   ↓
2. fetchContests() called
   ↓
3. Parallel API Calls:
   - fetchLeetCodeContests()
   - fetchCodeforcesContests()
   - fetchCodeChefContests()
   ↓
4. Merge all contests
   ↓
5. Upsert to MongoDB (update existing or create new)
   ↓
6. Mark past contests automatically
```

### 2. **Solution Matching Flow**

```
1. Cron Job Triggers (Daily at 10 PM)
   ↓
2. Find past contests without solutions
   ↓
3. For each contest:
   - Fetch videos from platform's YouTube playlist
   - Match video title with contest title
   - Update contest with solution link
   ↓
4. Database updated with solution links
```

### 3. **Frontend Data Flow**

```
User Action (e.g., Load Home Page)
   ↓
Component calls API service
   ↓
API service makes HTTP request to backend
   ↓
Backend queries MongoDB
   ↓
Response sent to frontend
   ↓
Component updates state
   ↓
UI re-renders with new data
```

### 4. **Bookmarking Flow**

```
User clicks bookmark button
   ↓
toggleBookmark() called
   ↓
Read bookmarked IDs from localStorage
   ↓
Add/Remove contest ID
   ↓
Save updated array to localStorage
   ↓
Update component state
   ↓
UI reflects bookmark status
```

---

## 📈 Performance Optimizations

1. **Database Indexing**: Compound index on (title, platform) for fast lookups
2. **Caching**: Contest data stored in MongoDB to reduce API calls
3. **Scheduled Updates**: Cron jobs prevent constant API polling
4. **Client-side Filtering**: Reduces server load
5. **Lazy Loading**: Components load data on demand
6. **Docker Multi-stage Build**: Smaller production images

---

## 🔒 Security Features

1. **Environment Variables**: Sensitive data stored in .env files
2. **CORS**: Configured for specific origins
3. **Input Validation**: URL validation for solution links
4. **Error Handling**: Comprehensive error handling at all layers
5. **No Authentication**: Currently no user authentication (localStorage-based bookmarks)

---

## 🚧 Future Enhancements

1. **User Authentication**: Sign up/login functionality
2. **Cloud Bookmarking**: Store bookmarks in database
3. **Notifications**: Email/push notifications for upcoming contests
4. **Contest Reminders**: Calendar integration
5. **More Platforms**: Add HackerRank, AtCoder, etc.
6. **Contest Analytics**: Statistics and trends
7. **Social Features**: Share contests, comments

---

## 📝 Key Points for Presentation

### Problem & Solution
- **Problem**: Developers struggle to track contests across multiple platforms
- **Solution**: Centralized contest tracker with automated updates

### Technical Highlights
- **MERN Stack**: Modern full-stack architecture
- **Automated Data Fetching**: Cron jobs keep data fresh
- **Smart Solution Matching**: AI-like title matching for YouTube videos
- **Responsive Design**: Works on all devices
- **CI/CD Pipeline**: Automated testing and deployment

### Features to Demonstrate
1. View contests from multiple platforms
2. Filter by platform and date
3. Bookmark contests
4. View today's contests
5. Access solution videos
6. Dark mode toggle

### Architecture Benefits
- **Scalable**: Can add more platforms easily
- **Maintainable**: Clean separation of concerns
- **Reliable**: Automated updates, error handling
- **Fast**: Cached data, optimized queries

---

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development (MERN)
- RESTful API design
- Database design and optimization
- Automated task scheduling
- External API integration
- Frontend state management
- Responsive UI design
- CI/CD pipeline setup
- Docker containerization
- Testing strategies

---

## 📞 Support & Resources

- **GitHub**: [Repository URL]
- **Documentation**: README.md files
- **API Docs**: Postman collection included
- **Testing**: Comprehensive test suite

---

**Made with ❤️ by Snehal Suman**

