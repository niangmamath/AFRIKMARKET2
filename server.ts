import app from './index';
import mongoose from 'mongoose';

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/leboncoin';

// --- Database Connection and Server Startup ---
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('MongoDB connected successfully.');
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}
