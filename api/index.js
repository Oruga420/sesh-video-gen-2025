// Re-export the Express app from the server.js file
const app = require('../server.js');

// Export a handler for Vercel serverless functions
module.exports = app;