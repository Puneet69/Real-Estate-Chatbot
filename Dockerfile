# Real Estate Chatbot - Multi-stage Docker Build

# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/real-estate-chatbot/package*.json ./
RUN npm ci --only=production
COPY frontend/real-estate-chatbot/ ./
RUN npm run build

# Stage 2: Backend with AI server
FROM node:18-alpine AS backend
WORKDIR /app

# Install Python for AI server
RUN apk add --no-cache python3 py3-pip

# Copy backend package files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy AI server requirements and install
COPY backend/ai_server/requirements.txt ./ai_server/
WORKDIR /app/backend/ai_server
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy AI server source
COPY backend/ai_server/ ./

# Copy built frontend
WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Expose ports
EXPOSE 5008 8000

# Create startup script
WORKDIR /app/backend
COPY <<EOF /app/start.sh
#!/bin/sh
# Start AI server in background
cd /app/backend/ai_server && python3 main.py &
# Start backend server
cd /app/backend && node server.js
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]