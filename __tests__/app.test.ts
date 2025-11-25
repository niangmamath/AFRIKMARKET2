import request from 'supertest';
import app from '../index';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/leboncoin-test';

// Connect to a test database before any tests run
beforeAll(async () => {
  await mongoose.connect(mongoUri);
  // Wait for the connection to be fully established
  await new Promise(resolve => mongoose.connection.once('open', resolve));
});

// Close the database connection after all tests are done
afterAll(async () => {
  // Use disconnect() to ensure all connections are closed
  await mongoose.disconnect();
});

describe('GET /', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});
