# Use a base image with Node.js pre-installed
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Set the environment variables
ENV PORT=3000

# Expose the port(s) that your bot will listen on (if necessary)
EXPOSE $PORT

# Start the application
CMD [ "npm", "start" ]
