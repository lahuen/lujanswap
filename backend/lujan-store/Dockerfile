FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm ci; fi

# Copy application code
COPY . .

# Build the application
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# Create admin placeholder in all possible locations
RUN mkdir -p .medusa/admin dist/admin build/admin && \
  echo '<!DOCTYPE html><html><head><title>Admin</title></head><body><h1>Admin Panel</h1></body></html>' > .medusa/admin/index.html && \
  echo '<!DOCTYPE html><html><head><title>Admin</title></head><body><h1>Admin Panel</h1></body></html>' > dist/admin/index.html && \
  echo '<!DOCTYPE html><html><head><title>Admin</title></head><body><h1>Admin Panel</h1></body></html>' > build/admin/index.html && \
  ls -la .medusa/ || true && \
  ls -la dist/ || true

EXPOSE 9000

# Ensure Medusa listens on all interfaces (required for Docker/Render)
ENV HOST=0.0.0.0
ENV PORT=9000


# Start the application (migrations will run automatically on first start)
CMD ["sh", "-c", "mkdir -p .medusa/admin && echo '<!DOCTYPE html><html><head><title>Admin</title></head><body><h1>Admin Panel</h1></body></html>' > .medusa/admin/index.html && npx medusa db:migrate && npx medusa start"]

