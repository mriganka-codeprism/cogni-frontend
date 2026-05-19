# Build stage
FROM node:20-alpine as build

# Accept build arguments for environment variables
# REACT_APP_PUBLIC_URL: Base path for the application (e.g., /app/frontend or empty for root)
# PUBLIC_URL: Create React App uses this for asset paths in HTML (must match REACT_APP_PUBLIC_URL)
ARG REACT_APP_PUBLIC_URL="/muCognitron"
ARG REACT_APP_API_URL=""
ARG REACT_APP_LINK_PATH="https://dev.ird.mu-sigma.com/muCognitron/"
ARG REACT_APP_FER_SOCKET=""
ARG REACT_APP_FER_URL=""

# Set as environment variables for the build
# PUBLIC_URL is used by Create React App for asset paths in HTML
ENV PUBLIC_URL=$REACT_APP_PUBLIC_URL
ENV REACT_APP_PUBLIC_URL=$REACT_APP_PUBLIC_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_LINK_PATH=$REACT_APP_LINK_PATH
ENV REACT_APP_FER_SOCKET=$REACT_APP_FER_SOCKET
ENV REACT_APP_FER_URL=$REACT_APP_FER_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i -f

# Copy source code
COPY . .

# Build the application (environment variables are baked into the bundle)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
