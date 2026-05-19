#!/bin/bash

# Exit on error
set -e

# Registry details
REGISTRY="registry.ird.mu-sigma.com"
REPOSITORY="mutalent/frontend"
VERSION="26.02.02"

# Build args — CRA bakes these at build time
REACT_APP_PUBLIC_URL=""
REACT_APP_API_URL="https://mucognitron.ird.mu-sigma.com/muCognitron"
REACT_APP_LINK_PATH="https://mucognitron.ird.mu-sigma.com"
REACT_APP_FER_URL="https://mucognitron.ird.mu-sigma.com:8003"
REACT_APP_FER_SOCKET="wss://mucognitron.ird.mu-sigma.com:8003/ws"

echo "Building Docker image with version: ${VERSION}"
echo "  REACT_APP_PUBLIC_URL=${REACT_APP_PUBLIC_URL}"
echo "  REACT_APP_API_URL=${REACT_APP_API_URL}"
echo "  REACT_APP_LINK_PATH=${REACT_APP_LINK_PATH}"
echo "  REACT_APP_FER_URL=${REACT_APP_FER_URL}"
echo "  REACT_APP_FER_SOCKET=${REACT_APP_FER_SOCKET}"

# Build the Docker image
docker build --no-cache \
    --build-arg REACT_APP_PUBLIC_URL="${REACT_APP_PUBLIC_URL}" \
    --build-arg REACT_APP_API_URL="${REACT_APP_API_URL}" \
    --build-arg REACT_APP_LINK_PATH="${REACT_APP_LINK_PATH}" \
    --build-arg REACT_APP_FER_URL="${REACT_APP_FER_URL}" \
    --build-arg REACT_APP_FER_SOCKET="${REACT_APP_FER_SOCKET}" \
    -t ${REGISTRY}/${REPOSITORY}:${VERSION} .

docker tag ${REGISTRY}/${REPOSITORY}:${VERSION} ${REGISTRY}/${REPOSITORY}:latest

# Push the Docker image
echo "Pushing Docker image to registry..."
docker push ${REGISTRY}/${REPOSITORY}:${VERSION}
docker push ${REGISTRY}/${REPOSITORY}:latest

echo "Successfully built and pushed image:"
echo "Image: ${REGISTRY}/${REPOSITORY}"
echo "Version: ${VERSION}"
echo "Latest tag: latest"
