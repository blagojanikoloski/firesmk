# Use the official Node.js image
FROM node:20.12.0

# Set working directory
WORKDIR /usr/src/app

# Install Angular CLI
RUN npm install -g @angular/cli@17.3.2

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the remaining source code
COPY . .

# Build the Angular application
RUN ng build --configuration production

# Expose the port the app runs on
EXPOSE 80

# Start the application
CMD ["ng", "serve", "--port", "80" , "--host", "0.0.0.0"]

