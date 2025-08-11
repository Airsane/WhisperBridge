# Use the official Node.js runtime as the base image
FROM node:24.5-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

CMD ["node", "index.js"] 