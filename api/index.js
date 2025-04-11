// Import the Express app
const app = require('../server');

// Export a serverless function handler
module.exports = (req, res) => {
  // Let the Express app handle the request
  return app(req, res);
};