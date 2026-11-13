
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const request = require('supertest');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    message: 'Welcome to the Student Management System REST API',
    endpoints: {
      students: '/api/students',
    },
    serverStatus: 'online',
    databaseStatus: dbStatus,
  });
});

app.use('/api/students', studentRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

async function runTests() {
  console.log('🧪 Starting Express REST API Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // Test 1: GET /
    const rootRes = await request(app).get('/');
    assert(rootRes.status === 200, 'GET / returns 200 OK');
    assert(rootRes.body.serverStatus === 'online', 'GET / returns serverStatus: online');

    // Test 2: 404 for undefined routes
    const notFoundRes = await request(app).get('/api/unknown-endpoint');
    assert(notFoundRes.status === 404, 'GET /api/unknown-endpoint returns 404 Not Found');
    assert(notFoundRes.body.success === false, '404 response contains success: false');

    // Test 3: Disconnected database protection returns 503
    mongoose.connection.readyState = 0; // Simulate disconnected
    const disconnectedRes = await request(app).get('/api/students');
    assert(disconnectedRes.status === 503, 'Returns 503 Service Unavailable when database is disconnected');
    assert(
      disconnectedRes.body.error === 'DATABASE_DISCONNECTED',
      'Returns descriptive DATABASE_DISCONNECTED error code'
    );

    // Mock connected state for route logic validation
    mongoose.connection.readyState = 1; // Simulate connected

    // Test 4: POST /api/students with empty body returns 400
    const emptyPostRes = await request(app).post('/api/students').send({});
    assert(emptyPostRes.status === 400, 'POST /api/students with empty body returns 400 Bad Request');
    assert(
      emptyPostRes.body.message.includes('mandatory'),
      'POST /api/students returns descriptive validation message'
    );

    // Test 5: POST /api/students with partial fields returns 400
    const partialPostRes = await request(app).post('/api/students').send({
      studentId: 'STU200',
      fullName: 'Incomplete Record',
    });
    assert(partialPostRes.status === 400, 'POST /api/students with missing fields returns 400');

    // Test 6: PUT /api/students/:id with invalid ObjectId returns 400
    const invalidPutRes = await request(app).put('/api/students/invalid-id-123').send({
      fullName: 'Updated Name',
    });
    assert(invalidPutRes.status === 400, 'PUT /api/students/invalid-id returns 400 Bad Request');
    assert(
      invalidPutRes.body.message.includes('Invalid student MongoDB ObjectId'),
      'PUT /api/students validates ObjectId parameter format'
    );

    // Test 7: DELETE /api/students/:id with invalid ObjectId returns 400
    const invalidDeleteRes = await request(app).delete('/api/students/invalid-id-123');
    assert(invalidDeleteRes.status === 400, 'DELETE /api/students/invalid-id returns 400 Bad Request');
    assert(
      invalidDeleteRes.body.message.includes('Invalid student MongoDB ObjectId'),
      'DELETE /api/students validates ObjectId parameter format'
    );

    console.log(`\n📋 API Test Summary: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 All Express REST API Tests Passed Successfully!\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
