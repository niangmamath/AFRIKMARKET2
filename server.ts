import dotenv from 'dotenv';
dotenv.config();

// --- DIAGNOSTIC LOGGING ---
console.log("--- STARTING DIAGNOSTIC ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Verifying MONGO_URI...");
if (process.env.MONGO_URI) {
    console.log("MONGO_URI is present.");
    // For security, let's only log the start and end of the URI
    const uri = process.env.MONGO_URI;
    console.log(`MONGO_URI format: ${uri.substring(0, 15)}...${uri.substring(uri.length - 5)}`);
} else {
    console.log("FATAL: MONGO_URI is NOT FOUND in process.env!");
}
console.log("--- ENDING DIAGNOSTIC ---");
// --- END DIAGNOSTIC ---

import app from './index';
import connectDB from './config/db';

const port = process.env.PORT || 3000;

// --- Database Connection and Server Startup ---
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })();
}
