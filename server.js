const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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
        // Log the detailed error from Replicate
        console.error('--- Error calling Replicate API ---');
        console.error('Status Code:', error.response?.status);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2)); // Log the full error response
        console.error('-----------------------------------');
        
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.detail || 'Failed to create prediction via backend'
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

// Root route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server in non-Vercel environments
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless deployment
module.exports = app;