FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy app source
COPY . .

EXPOSE 3000

# Start Next in dev mode to support local development with mounted volumes
CMD ["npm", "run", "dev"]
