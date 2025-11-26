import request from 'supertest';

// --- FINAL & CORRECTED MOCKING STRATEGY ---
jest.mock('mongoose', () => {
  // This object simulates the entire Mongoose query chain from the route.
  const mockQuery = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue([]), // The end of the chain resolves a promise.
  };

  // Ad.find() will start the query chain by returning the mockQuery object.
  const mockModel = {
    find: jest.fn(() => mockQuery),
  };

  // mongoose.model() will return our mock model.
  const MockModelFn = jest.fn(() => mockModel);

  // --- Boilerplate for app loading ---
  const mockSchemaInstance = {
    pre: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    methods: {},
    plugin: jest.fn().mockReturnThis(),
  };
  
  // Use `as any` to satisfy TypeScript when adding static properties to the mock.
  const MockSchema = jest.fn(() => mockSchemaInstance) as any; // <-- THE FIX IS HERE
  MockSchema.Types = { ObjectId: jest.fn(() => 'mockId') };

  return {
    __esModule: true,
    default: {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      Schema: MockSchema,
      model: MockModelFn,
    },
    Schema: MockSchema,
    model: MockModelFn,
  };
});

// Import the app *after* the mock is defined.
import app from '../index';

describe('GET /', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 OK and attempt to fetch ads', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);

    // Get a handle to our mock functions to check how they were called.
    const Ad = require('mongoose').model();

    // Verify the entire chain was called as expected.
    expect(Ad.find).toHaveBeenCalledWith(); // Called with NO arguments
    expect(Ad.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(Ad.find().limit).toHaveBeenCalledWith(10);
    expect(Ad.find().populate).toHaveBeenCalledWith('author');
  });
});
