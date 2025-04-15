# Use Node.js base image
FROM node:22 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Use a smaller image for production
FROM node:22 AS runner
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "run", "start"]
