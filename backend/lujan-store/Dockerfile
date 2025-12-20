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
RUN MEDUSA_ADMIN_DISABLED=true sh -c "if [ -f yarn.lock ]; then yarn build; else npm run build; fi"

# Failsafe: Create admin placeholder even if build skipped UI
RUN mkdir -p .medusa/admin && echo '<!DOCTYPE html><html><body>Admin Disabled</body></html>' > .medusa/admin/index.html

EXPOSE 9000

ENV HOST=0.0.0.0
ENV PORT=9000

# Start the application (migrations run on start)
# Start the application (create key using script and start)
CMD ["sh", "-c", "npx medusa db:migrate && (npx medusa exec ./src/scripts/create-p-key.ts || true) && npx medusa start --host 0.0.0.0 --port 9000"]

# Force redeploy
