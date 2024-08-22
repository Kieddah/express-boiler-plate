# Use the official Node.js image as a base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code, including the src directory
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Define the command to start your app
CMD ["node", "app.js"]
