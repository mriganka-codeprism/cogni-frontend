# Basepath Configuration: /muCognitron

## ✅ Configuration Complete

The application is now configured to use `/muCognitron` as the basepath.

## Changes Made

### 1. GitLab CI/CD (`.gitlab-ci.yml`)
- Set default `REACT_APP_PUBLIC_URL` to `/muCognitron`
- Environment variables are passed as build arguments during Docker build

### 2. Dockerfile
- Already configured to accept `REACT_APP_PUBLIC_URL` as build argument
- Environment variables are baked into the React bundle at build time

### 3. Nginx Configuration (`nginx.conf`)
- Updated to handle requests with `/muCognitron` basepath
- Redirects root `/` to `/muCognitron/`
- Strips basepath prefix when serving static files
- Handles React Router SPA routing under `/muCognitron/`

## How It Works

### URL Structure
- **Root redirect**: `http://172.25.1.60:30829/` → redirects to `/muCognitron/`
- **App access**: `http://172.25.1.60:30829/muCognitron/`
- **Routes**: `http://172.25.1.60:30829/muCognitron/login`, `/muCognitron/admin`, etc.

### Static Assets
- Referenced as: `/muCognitron/static/js/main.js`
- Served from: `/usr/share/nginx/html/static/js/main.js` (nginx strips basepath)

### React Router
- `basename="/muCognitron"` is set in BrowserRouter
- All routes are relative to `/muCognitron/`

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add .gitlab-ci.yml nginx.conf Dockerfile
git commit -m "Configure basepath as /muCognitron"
git push
```

### 2. Rebuild Docker Image
- Go to GitLab → CI/CD → Pipelines
- Run the `build-frontend` job manually
- The build will use `REACT_APP_PUBLIC_URL=/muCognitron` by default

### 3. Deploy to Kubernetes
The deployment will automatically pull the new image (if `imagePullPolicy: Always` is set).

Or restart the deployment:
```bash
kubectl rollout restart deployment/frontend-deployment -n dev-mukaushal
```

### 4. Verify
1. Access: `http://172.25.1.60:30829/` (should redirect to `/muCognitron/`)
2. Access: `http://172.25.1.60:30829/muCognitron/` (should show login page)
3. Check browser DevTools → Network tab:
   - Static assets should load from `/muCognitron/static/...`
   - All requests should return `200 OK`

## Overriding Basepath (Optional)

If you need a different basepath for a specific environment:

### Option 1: GitLab CI/CD Variables
1. Go to GitLab → Settings → CI/CD → Variables
2. Add variable: `REACT_APP_PUBLIC_URL` = `/your/custom/path`
3. This will override the default `/muCognitron`

### Option 2: Build Locally
```bash
docker build \
  --build-arg REACT_APP_PUBLIC_URL="/your/custom/path" \
  --build-arg REACT_APP_API_URL="http://api-gateway-service:8005/muCognitron" \
  --build-arg REACT_APP_APPLINK_PATH="" \
  --build-arg REACT_APP_FER_SOCKET="ws://fer-service:8001/ws" \
  --build-arg REACT_APP_FER_URL="http://fer-service:8001" \
  -t frontend:latest .
```

**Note**: If you change the basepath, you'll also need to update `nginx.conf` to match the new basepath.

## Troubleshooting

### Issue: 404 errors for static assets
- **Check**: Verify nginx config matches the basepath
- **Solution**: Ensure `location /muCognitron/static/` block is correct

### Issue: Routes not working
- **Check**: Verify `REACT_APP_PUBLIC_URL` was set during build
- **Solution**: Check build logs to confirm the environment variable was passed

### Issue: Redirect loop
- **Check**: Verify nginx redirect logic
- **Solution**: Ensure `location = /` redirects to `/muCognitron/` (with trailing slash)

### Issue: App works at root but not at basepath
- **Check**: Verify the image was rebuilt with the new basepath
- **Solution**: Rebuild the Docker image and redeploy

## Current Configuration Summary

- **Basepath**: `/muCognitron`
- **Build-time variable**: `REACT_APP_PUBLIC_URL=/muCognitron`
- **Access URL**: `http://172.25.1.60:30829/muCognitron/`
- **Nginx**: Configured to handle basepath routing

