#!/bin/bash

# Exit on error
set -e

# Container details
REGISTRY="registry.ird.mu-sigma.com"
REPOSITORY="mutalent/frontend"
VERSION="26.02.02"
PORT="8010"
CONTAINER_NAME="mukaushal-frontend"

echo "Starting Docker container..."

# Stop and remove existing container (if any)
docker rm -f ${CONTAINER_NAME} 2>/dev/null || true

# Start the container
docker run -d \
    --name ${CONTAINER_NAME} \
    --restart unless-stopped \
    -p ${PORT}:80 \
    ${REGISTRY}/${REPOSITORY}:${VERSION}

echo "Container started successfully"
echo "Access the application at: http://localhost:${PORT}"
