import request from 'supertest';
import app from '../index';
import mongoose from 'mongoose';
import http from 'http';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/leboncoin-test';

let server: http.Server;

// Connect to DB and start the server before any tests run
beforeAll((done) => {
  mongoose.connect(mongoUri).then(() => {
    server = http.createServer(app);
    server.listen(done); // Start server and call done() when ready
  });
});

// Close the server and the database connection after all tests are done
afterAll((done) => {
  mongoose.disconnect().then(() => {
    server.close(done); // Close server and call done() when finished
  });
});

describe('GET /', () => {
  it('should return 200 OK', async () => {
    // Use the running server for the test request
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
  });
});
