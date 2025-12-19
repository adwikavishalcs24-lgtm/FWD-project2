

const express = require('express');
const request = require('supertest');

// Create a test app by importing just the app without starting the server
const createTestApp = () => {
  const app = express();
  const cors = require('cors');
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '10mb' }));

  // Import and use routes
  const authRoutes = require('./routes/auth');
  const gameRoutes = require('./routes/game');
  const leaderboardRoutes = require('./routes/leaderboard');
  const miniGameRoutes = require('./routes/miniGame');
  const userRoutes = require('./routes/user');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/game', gameRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/mini-games', miniGameRoutes);
  app.use('/api/user', userRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  return app;
};

// Test suite for backend API endpoints
async function testAPIEndpoints() {
  console.log('🧪 Starting Backend API Testing...\n');
  
  const testApp = createTestApp();

  // Test health check endpoint
  console.log('📡 Testing health check endpoint...');
  const healthResponse = await request(testApp).get('/api/health');
  console.log('✅ Health check:', healthResponse.status, healthResponse.body);

  // Test auth endpoints (unauthenticated)
  console.log('\n🔐 Testing authentication endpoints...');
  
  // Test register endpoint
  const registerData = {
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'TestPass123',
    display_name: 'Test User'
  };
  
  const registerResponse = await request(testApp)
    .post('/api/auth/register')
    .send(registerData);
  
  console.log('✅ Register:', registerResponse.status);
  let authToken = null;
  
  if (registerResponse.status === 201) {
    authToken = registerResponse.body.token;
    console.log('📝 User registered with token:', authToken ? 'Present' : 'Missing');
  } else {
    console.log('❌ Register failed:', registerResponse.body);
  }

  // Test login endpoint
  if (registerResponse.status !== 201) {
    const loginResponse = await request(testApp)
      .post('/api/auth/login')
      .send({
        username: registerData.username,
        password: registerData.password
      });
    
    console.log('✅ Login:', loginResponse.status);
    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  }

  // Test authenticated endpoints
  if (authToken) {
    console.log('\n🔒 Testing authenticated endpoints...');
    
    // Test get user profile
    const profileResponse = await request(testApp)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`);
    
    console.log('✅ Get profile:', profileResponse.status);

    // Test leaderboard endpoints
    const leaderboardResponse = await request(testApp)
      .get('/api/leaderboard/score')
      .set('Authorization', `Bearer ${authToken}`);
    
    console.log('✅ Score leaderboard:', leaderboardResponse.status);

    // Test mini-games endpoints
    const miniGamesResponse = await request(testApp)
      .get('/api/mini-games/available')
      .set('Authorization', `Bearer ${authToken}`);
    
    console.log('✅ Mini-games available:', miniGamesResponse.status);

    // Test leaderboard stats
    const statsResponse = await request(testApp)
      .get('/api/leaderboard/global-stats');
    
    console.log('✅ Global stats:', statsResponse.status);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Test database connection
async function testDatabaseConnection() {
  console.log('🗄️ Testing database connection...');
  
  try {
    const { testConnection } = require('./config/database');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed');
      console.log('💡 Make sure MySQL is running and credentials are correct in .env file');
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
  }
}

// Run tests
async function runTests() {
  try {
    await testDatabaseConnection();
    await testAPIEndpoints();
  } catch (error) {
    console.error('❌ Test execution error:', error);
  }
  
  process.exit(0);
}

if (require.main === module) {
  runTests();
}

module.exports = { testAPIEndpoints, testDatabaseConnection };
