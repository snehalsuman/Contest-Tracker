# Contest Tracker

A MERN-based web application to track upcoming and past coding contests from LeetCode, Codeforces, and CodeChef.

## Features

- ✅ **Upcoming & Past Contests** – View contests from LeetCode, Codeforces, and CodeChef
- ✅ **Today's Contests** – Easily see contests happening today
- ✅ **Bookmark Contests** – Save your favorite contests for later
- ✅ **Submit Solutions** – Attach YouTube solutions for past contests
- ✅ **Dark Mode** – Toggle between light and dark themes
- ✅ **Fast & Responsive UI** – Built with React & TailwindCSS

## Tech Stack

- **Frontend**: React, TailwindCSS, React Router
- **Backend**: Node.js, Express.js, MongoDB
- **API Integration**: Codeforces API, LeetCode GraphQL, CodeChef API
- **Deployment**: Docker, Docker Compose

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/snehalsuman/contest-tracker.git
   cd contest-tracker
   ```

2. **Create environment file**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - MongoDB: localhost:27017

## Development Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/contests` - Get all contests
- `GET /api/contests?platform=leetcode` - Filter by platform
- `GET /api/contests?past=true` - Get past contests
- `POST /api/contests/solution/:id` - Add solution link

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGO_URI=mongodb://localhost:27017/contest-tracker
PORT=5000
NODE_ENV=development
```

## Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Made with ❤️ by [Snehal Suman](https://github.com/snehalsuman)