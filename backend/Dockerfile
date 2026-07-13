FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --production=false

# Copy source
COPY . .

EXPOSE 5000

# Use nodemon in development for hot reload; compose mounts the source.
CMD ["npm", "run", "dev"]
