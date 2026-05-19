# Interview AI Frontend

This is the frontend application for the Interview AI system, built with React and TypeScript. The application provides an interactive interview platform with real-time facial emotion recognition and video capabilities.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker (for containerized deployment)
- Modern web browser with WebRTC support
- Camera and microphone access

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Copy the environment template and configure your variables:
   ```bash
   cp .env.template .env
   ```
4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The application will be available at `http://localhost:9005`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### API Configuration
- `REACT_APP_API_URL`: URL of the app/mukaushal API (e.g., http://localhost:8000/app/mukaushal)
- `REACT_APP_APPLINK_PATH`: Path for application links (e.g., /app/interview)

### FER (Facial Emotion Recognition) Configuration
- `REACT_APP_FER_URL`: Base URL where the FER service is running (e.g., http://localhost:8001)
- `REACT_APP_FER_SOCKET`: WebSocket URL for real-time FER communication (e.g., ws://localhost:8001/ws)

### Other Configuration
- `PORT`: Port number for the development server (default: 9005)

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm run sonar`: Runs SonarQube analysis

## Docker Deployment

To build and run the application using Docker:

```bash
# Build the Docker image
docker build -t interview-ai-frontend .

# Run the container
docker run -p 9005:9005 \
  -e REACT_APP_API_URL=<your-api-url> \
  -e REACT_APP_FER_URL=<your-fer-url> \
  -e REACT_APP_FER_SOCKET=<your-fer-socket-url> \
  -e REACT_APP_APPLINK_PATH=<your-applink-path> \
  interview-ai-frontend
```

## Project Structure

```
src/
├── components/     # Reusable React components
├── services/      # API services and utilities
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── context/       # React context providers
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets (images, fonts, etc.)
```

## Key Features

- Real-time video interviews
- Facial emotion recognition
- Live chat functionality
- PDF document handling
- Responsive design
- Authentication and authorization
- Real-time emotion analysis

## Dependencies

Major dependencies include:
- React 18 - UI library
- Material-UI - Component library
- LiveKit - Video functionality
- Face-API.js - Facial recognition
- React Router - Navigation
- Axios - API calls
- WebSocket - Real-time communication
- PDF.js - PDF handling
- Day.js - Date manipulation

## Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use functional components with hooks
   - Implement proper error handling
   - Write meaningful comments

2. **Testing**
   - Write unit tests for components
   - Test API integrations
   - Ensure proper error handling
   - Maintain good test coverage

3. **Performance**
   - Optimize bundle size
   - Implement lazy loading
   - Use proper caching strategies
   - Monitor and optimize render cycles

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## Troubleshooting

Common issues and solutions:

1. **Video/Audio Issues**
   - Ensure browser permissions are granted
   - Check WebRTC support
   - Verify camera/microphone access

2. **FER Connection Issues**
   - Check WebSocket connection
   - Verify FER service is running
   - Check network connectivity

3. **API Connection Issues**
   - Verify API URL configuration
   - Check network connectivity
   - Verify authentication status

## License

[Add your license information here] 