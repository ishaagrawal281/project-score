FROM node:22-alpine

WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --production=false

# Copy source
COPY . .

EXPOSE 5000

# Start the application
CMD ["npm", "start"]
