document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const durationInput = document.getElementById('duration');
    const modelSelect = document.getElementById('model');
    const startImageGroup = document.getElementById('start-image-group');
    const startImageInput = document.getElementById('start-image');
    const generateBtn = document.getElementById('generate-btn');
    const resultContainer = document.querySelector('.result-container');
    const videoElement = document.getElementById('output-video');
    const loadingElement = document.querySelector('.loading');
    const statusMessage = document.getElementById('status-message');
    const downloadBtn = document.getElementById('download-btn');
    
    // Get additional model inputs
    const endImageGroup = document.getElementById('end-image-group');
    const endImageInput = document.getElementById('end-image');
    const negativePromptGroup = document.getElementById('negative-prompt-group');
    const negativePromptInput = document.getElementById('negative-prompt');
    const cfgScaleGroup = document.getElementById('cfg-scale-group');
    const cfgScaleInput = document.getElementById('cfg-scale');
    const cfgScaleValue = document.getElementById('cfg-scale-value');
    const aspectRatioGroup = document.getElementById('aspect-ratio-group');
    const aspectRatioInput = document.getElementById('aspect-ratio');
    const loopGroup = document.getElementById('loop-group');
    const loopInput = document.getElementById('loop');
    const promptOptimizerGroup = document.getElementById('prompt-optimizer-group');
    const promptOptimizerInput = document.getElementById('prompt-optimizer');
    const maxAreaGroup = document.getElementById('max-area-group');
    const maxAreaInput = document.getElementById('max-area');
    
    // Update CFG scale value display
    cfgScaleInput.addEventListener('input', () => {
        cfgScaleValue.textContent = cfgScaleInput.value;
    });
    
    // Show/hide inputs based on model selection
    modelSelect.addEventListener('change', () => {
        // Hide all model-specific inputs first
        startImageGroup.style.display = 'none';
        endImageGroup.style.display = 'none';
        negativePromptGroup.style.display = 'none';
        cfgScaleGroup.style.display = 'none';
        aspectRatioGroup.style.display = 'none';
        loopGroup.style.display = 'none';
        promptOptimizerGroup.style.display = 'none';
        maxAreaGroup.style.display = 'none';
        
        // Reset duration input as default
        durationInput.value = 5;
        durationInput.min = 1;
        durationInput.max = 60;
        durationInput.step = 1;
        
        // Show inputs based on selected model
        if (modelSelect.value === 'kwaivgi/kling-v1.6-pro') {
            startImageGroup.style.display = 'block';
            endImageGroup.style.display = 'block';
            negativePromptGroup.style.display = 'block';
            cfgScaleGroup.style.display = 'block';
            aspectRatioGroup.style.display = 'block';
            
            // Adjust duration input for Kling (only allows 5s or 10s)
            durationInput.value = 5;
            durationInput.min = 5;
            durationInput.max = 10;
            durationInput.step = 5;
        } else if (modelSelect.value === 'luma/ray-flash-2-720p') {
            startImageGroup.style.display = 'block';
            startImageInput.placeholder = 'Optional: URL for starting frame';
            document.querySelector('#start-image-group .help-text').textContent = 'Optional: URL to an image to use as the starting frame';
            
            endImageGroup.style.display = 'block';
            endImageInput.placeholder = 'Optional: URL for ending frame';
            document.querySelector('#end-image-group .help-text').textContent = 'Optional: URL to an image to use as the ending frame';
            
            aspectRatioGroup.style.display = 'block';
            loopGroup.style.display = 'block';
        } else if (modelSelect.value === 'minimax/video-01-live') {
            startImageGroup.style.display = 'block';
            startImageInput.placeholder = 'Required: URL for first frame image';
            document.querySelector('#start-image-group .help-text').textContent = 'Required: URL to an image to animate with the video model';
            promptOptimizerGroup.style.display = 'block';
        } else if (modelSelect.value === 'wavespeedai/wan-2.1-t2v-720p') {
            // Wavespeed Wan T2V only requires a prompt, no special inputs
            // Using base configuration
        } else if (modelSelect.value === 'wavespeedai/wan-2.1-i2v-720p') {
            // Wavespeed Wan I2V requires an input image
            startImageGroup.style.display = 'block';
            startImageInput.placeholder = 'Required: URL for input image';
            document.querySelector('#start-image-group .help-text').textContent = 'Required: URL to an image to animate';
            
            // Also show max area option
            maxAreaGroup.style.display = 'block';
        }
    });

    let predictionId = null;
    let videoUrl = null;

    // Function to create a prediction
    async function createPrediction() {
        const prompt = promptInput.value.trim();
        const duration = durationInput.value;
        const model = modelSelect.value;
        const startImage = startImageInput.value.trim();
        const endImage = endImageInput ? endImageInput.value.trim() : '';
        const negativePrompt = negativePromptInput ? negativePromptInput.value.trim() : '';
        const cfgScale = cfgScaleInput ? parseFloat(cfgScaleInput.value) : 0.5;
        const aspectRatio = aspectRatioInput ? aspectRatioInput.value : '16:9';
        const loop = loopInput ? loopInput.checked : false;
        const promptOptimizer = promptOptimizerInput ? promptOptimizerInput.checked : true;
        const maxArea = maxAreaInput ? maxAreaInput.value : '720x1280';

        if (!prompt) {
            alert('Please enter a prompt for your video');
            return;
        }
        
        // Check if Kling model is selected and requires a start image
        if (model === 'kwaivgi/kling-v1.6-pro' && !startImage) {
            alert('The Kling model requires a start image URL');
            return;
        }

        // Disable button and show loading
        generateBtn.disabled = true;
        resultContainer.classList.remove('hidden');
        loadingElement.classList.remove('hidden');
        videoElement.classList.add('hidden');
        downloadBtn.classList.add('hidden');
        statusMessage.textContent = 'Starting video generation...';

        try {
            // Prepare the input based on the selected model
            const input = {
                prompt: prompt
            };
            
            // Add model-specific parameters
            if (model === 'google/veo-2') {
                input.duration = parseInt(duration);
            } else if (model === 'kwaivgi/kling-v1.6-pro') {
                // Required parameters
                input.start_image = startImage;
                input.duration = parseInt(duration);
                
                // Optional parameters
                if (endImage) {
                    input.end_image = endImage;
                }
                
                if (negativePrompt) {
                    input.negative_prompt = negativePrompt;
                }
                
                input.cfg_scale = cfgScale;
                
                // Only include aspect_ratio if no start image is provided
                if (!startImage) {
                    input.aspect_ratio = aspectRatio;
                }
            } else if (model === 'luma/ray-flash-2-720p') {
                // Required parameters
                input.duration = parseInt(duration);
                input.aspect_ratio = aspectRatio;
                input.loop = loop;
                
                // Optional parameters
                if (startImage) {
                    input.start_image_url = startImage;
                }
                
                if (endImage) {
                    input.end_image_url = endImage;
                }
            } else if (model === 'minimax/video-01-live') {
                // Required parameters
                if (!startImage) {
                    alert('Minimax Video Live requires a first frame image');
                    throw new Error('First frame image is required');
                }
                input.first_frame_image = startImage;
                input.prompt_optimizer = promptOptimizer;
            } else if (model === 'wavespeedai/wan-2.1-t2v-720p') {
                // Wavespeed Wan T2V only requires a prompt, which is already set
                // No additional parameters needed
            } else if (model === 'wavespeedai/wan-2.1-i2v-720p') {
                // Required parameters
                if (!startImage) {
                    alert('Wavespeed Wan I2V requires an input image');
                    throw new Error('Input image is required');
                }
                input.image = startImage;
                input.max_area = maxArea;
            }
            
            // Make the API call to create a prediction
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    input: input
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start video generation');
            }
            
            const data = await response.json();
            predictionId = data.id;
            
            // Start polling for prediction status
            statusMessage.textContent = 'Generating your video (this may take a few minutes)...';
            pollPredictionStatus();
        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = `Error: ${error.message}`;
            generateBtn.disabled = false;
        }
    }
    
    // Function to poll for prediction status
    async function pollPredictionStatus() {
        if (!predictionId) return;
        
        try {
            const response = await fetch(`/api/predictions/${predictionId}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get prediction status');
            }
            
            const data = await response.json();
            const status = data.status;
            
            if (status === 'succeeded') {
                // The prediction is complete, show the video
                videoUrl = data.output;
                
                if (typeof videoUrl === 'string') {
                    // Single output (URL)
                    videoElement.src = videoUrl;
                } else if (Array.isArray(videoUrl)) {
                    // Array of URLs (some models return array)
                    videoElement.src = videoUrl[0];
                } else {
                    // Object with multiple outputs
                    videoElement.src = videoUrl.video || videoUrl.gif || Object.values(videoUrl)[0];
                }
                
                loadingElement.classList.add('hidden');
                videoElement.classList.remove('hidden');
                downloadBtn.classList.remove('hidden');
                generateBtn.disabled = false;
                statusMessage.textContent = 'Video generation complete!';
            } else if (status === 'failed') {
                throw new Error(data.error || 'Video generation failed');
            } else {
                // Still processing, poll again after a delay
                if (data.logs) {
                    const logs = data.logs.split('\n').filter(Boolean);
                    if (logs.length > 0) {
                        const lastLog = logs[logs.length - 1];
                        if (lastLog.includes('%')) {
                            statusMessage.textContent = `Generating your video: ${lastLog}`;
                        }
                    }
                }
                setTimeout(pollPredictionStatus, 2000);
            }
        } catch (error) {
            console.error('Error polling status:', error);
            statusMessage.textContent = `Error: ${error.message}`;
            generateBtn.disabled = false;
        }
    }
    
    // Event listener for the generate button
    generateBtn.addEventListener('click', createPrediction);
    
    // Event listener for the download button
    downloadBtn.addEventListener('click', () => {
        if (!videoUrl) return;
        
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'generated-video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});