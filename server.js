const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Replicate API key from environment variables
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

if (!REPLICATE_API_KEY) {
    console.error('REPLICATE_API_KEY is not set in environment variables');
    // In production, don't exit the process as it will crash the serverless function
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
}

// API endpoint to create a prediction
app.post('/api/predict', async (req, res) => {
    const { model, input } = req.body;
    
    if (!model || !input || !input.prompt) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: model,
                input: input
            },
            {
                headers: {
                    'Authorization': `Token ${REPLICATE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error creating prediction:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.detail || 'Failed to create prediction'
        });
    }
});

// API endpoint to get prediction status
app.get('/api/predictions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(
            `https://api.replicate.com/v1/predictions/${id}`,
            {
                headers: {
                    'Authorization': `Token ${REPLICATE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error getting prediction:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.detail || 'Failed to get prediction'
        });
    }
});

// API endpoint to cancel a prediction
app.post('/api/predictions/:id/cancel', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.post(
            `https://api.replicate.com/v1/predictions/${id}/cancel`,
            {},
            {
                headers: {
                    'Authorization': `Token ${REPLICATE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error canceling prediction:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.detail || 'Failed to cancel prediction'
        });
    }
});

// Root route for health check
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

// Start server in non-Vercel environments
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless deployment
module.exports = app;