FROM node:22-alpine

WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --production=false

# Copy source
COPY . .

# Generate Prisma client - set a dummy DATABASE_URL for build time
RUN DATABASE_URL="postgresql://dummy:dummy@localhost/dummy" npx prisma generate

EXPOSE 5000

# Start the application
CMD ["npm", "start"]
