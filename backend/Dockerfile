FROM node:22-alpine

WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --production=false

# Copy source
COPY . .

# Generate Prisma client (DATABASE_URL not needed for schema generation)
RUN npx prisma generate

EXPOSE 5000

# Start the application
CMD ["npm", "start"]
