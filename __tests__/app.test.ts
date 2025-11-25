import request from 'supertest';
import app from '../index';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/leboncoin-test';

// Connect to a test database before any tests run
beforeAll(async () => {
  await mongoose.connect(mongoUri);
});

// Close the database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});
