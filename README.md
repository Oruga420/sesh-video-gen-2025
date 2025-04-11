# AI Video Generator

A web application for generating AI videos using the Replicate API and Google's VEO 2 model.

## Features

- Generate videos from text prompts
- Adjust video duration
- Download generated videos
- Simple and responsive user interface

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your Replicate API key
4. Start the server:
   ```
   npm start
   ```
   
## Development

For development with auto-reload:
```
npm run dev
```

## Vercel Deployment

This application is configured for deployment on Vercel.

1. Fork or clone this repository to your GitHub account
2. Connect your GitHub repository to Vercel
3. During setup, make sure to:
   - Set the Environment Variable `REPLICATE_API_KEY` with your API key
   - Ensure the Framework Preset is set to "Node.js"
4. Deploy the application

The `vercel.json` file in this repository is configured to properly handle both API routes and static content.

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- API: Replicate (Google VEO 2 model)
- Deployment: Vercel

## API Documentation

The application uses the Replicate API to generate videos. For more information, visit [Replicate's documentation](https://replicate.com/docs).