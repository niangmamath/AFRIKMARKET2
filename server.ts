import dotenv from 'dotenv';
dotenv.config();

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
