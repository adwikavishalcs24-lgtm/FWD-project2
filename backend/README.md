# Time Travel Tycoon - Backend API

A comprehensive Node.js/Express backend with MySQL database, JWT authentication, and real-time features for the Time Travel Tycoon game.

## 🚀 Features

- **RESTful API** with Express.js
- **JWT Authentication** with secure token management
- **MySQL Database** with connection pooling
- **Real-time Features** via Socket.IO
- **Security Middleware** (Helmet, CORS, Rate Limiting)
- **Input Validation** and sanitization
- **Comprehensive Error Handling**
- **Achievement System**
- **Multi-timeline Leaderboards**

## 📋 Prerequisites

- Node.js (v16+)
- MySQL (v8.0+)
- npm or yarn

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p < database/schema.sql
   ```

3. **Environment Configuration**
   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=time_travel_tycoon

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Schema

The backend includes a comprehensive MySQL schema with:

### Core Tables
- **users** - User accounts and authentication
- **game_sessions** - Game state and progress
- **mini_game_scores** - Mini-game performance data
- **resources** - Timeline-specific resources
- **timeline_stability** - Timeline integrity tracking
- **achievements** - User achievements and progress
- **leaderboards** - Global rankings
- **multiplayer_sessions** - Real-time multiplayer support

### Views & Procedures
- **top_scores** - Leaderboard view
- **mini_game_leaderboard** - Mini-game rankings
- **Stored procedures** for common operations

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user
- `POST /verify-token` - Verify JWT token
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Logout user
- `PUT /change-password` - Change password

### Game Management (`/api/game`)
- `GET /session` - Get current game session
- `POST /session` - Create new game session
- `PUT /session` - Update game session
- `POST /session/end` - End game session
- `GET /stats` - Get game statistics
- `POST /save-progress` - Save game progress

### Leaderboards (`/api/leaderboard`)
- `GET /score` - Top scores leaderboard
- `GET /mini-games` - Mini-games played leaderboard
- `GET /time-played` - Time played leaderboard
- `GET /mini-game/:timeline/:gameId` - Specific mini-game leaderboard
- `GET /user/:userId` - User rankings
- `GET /global-stats` - Global statistics
- `GET /recent-games` - Recent games

### Mini-Games (`/api/mini-games`)
- `POST /submit-score` - Submit mini-game score
- `GET /high-scores/:timeline/:gameId` - High scores
- `GET /user-scores/:timeline/:gameId` - User scores
- `GET /available` - Available mini-games
- `GET /user-stats` - User mini-game statistics
- `POST /validate-score` - Validate score

### User Management (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /achievements` - User achievements
- `GET /statistics` - Detailed statistics
- `DELETE /account` - Delete account

## 🔌 Socket.IO Events

### Client → Server
- `game_session_update` - Update game session
- `mini_game_score` - Share mini-game score
- `game_event` - Broadcast game events
- `chat_message` - Send chat message
- `join_room` - Join chat room
- `leave_room` - Leave chat room
- `ping` - Heartbeat

### Server → Client
- `connected` - Connection confirmation
- `user_online/offline` - User status
- `session_state` - Game session data
- `score_shared` - Shared scores
- `game_event_received` - Game events
- `chat_message_received` - Chat messages
- `room_joined/left` - Room events
- `pong` - Heartbeat response

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test endpoints manually:
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'
```

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Rate Limiting** (IP and user-based)
- **Input Validation** with express-validator
- **Input Sanitization** to prevent XSS
- **CORS Configuration** for cross-origin requests
- **Helmet Security** headers
- **Audit Logging** for user actions

## 📊 Available Mini-Games

### Past Timeline
- **Blacksmith Forge Simulator** - Industrial-era metalworking
- **Steam Engine Pressure Control** - Steam power management
- **Ancient Clockmaker Alignment** - Precision timekeeping
- **Telegraph Morse Decoder** - Communication technology

### Present Timeline
- **Traffic Signal Controller** - Urban traffic management
- **Stock Market Decision Game** - Financial trading
- **Energy Grid Balancer** - Power distribution

### Future Timeline
- **Time Rift Stabilizer** - Temporal mechanics
- **AI Defense Matrix** - Cybersecurity
- **Fusion Reactor Control** - Advanced energy

## 🏆 Achievement System

- **First Steps** - Complete first mini-game
- **Mini-Game Master** - Complete 10 mini-games
- **High Scorer** - Score 500+ in any game
- **Perfectionist** - Score 1000 in any game
- **Time Traveler** - Play across all timelines
- **Score Collector** - Earn 10,000 credits
- **Persistent** - Play for 1 hour total

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure proper database credentials
   - Set secure CORS origins

2. **Database**
   - Run schema.sql in production
   - Set up database backups
   - Configure connection pooling

3. **Security**
   - Enable HTTPS
   - Configure firewall
   - Set up monitoring
   - Regular security updates

4. **Process Management**
   - Use PM2 or similar
   - Set up log rotation
   - Configure health checks

## 📈 Performance Optimization

- **Connection Pooling** for database efficiency
- **Rate Limiting** to prevent abuse
- **Caching** for frequently accessed data
- **Compression** for API responses
- **Pagination** for large datasets

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check MySQL is running
   mysql -u root -p
   
   # Verify credentials in .env
   # Test connection
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -ti:5000
   
   # Kill process
   kill -9 <PID>
   ```

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set in .env
   - Check token expiration
   - Verify Authorization header format

4. **CORS Errors**
   - Check FRONTEND_URL in .env
   - Verify CORS configuration in server.js

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is part of the Time Travel Tycoon game suite.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Test with the provided test suite
- Check server logs for errors

---

**🎮 Ready for Time Travel Adventures!**
