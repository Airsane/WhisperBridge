# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S discordbot -u 1001

# Change ownership of the app directory to the user
RUN chown -R discordbot:nodejs /app
USER discordbot

# Expose the port your app runs on (if needed)
# EXPOSE 3000

# Start the application
CMD ["node", "index.js"] 