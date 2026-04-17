FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy app
COPY . .

# Build app
RUN npm run build

# Remove dev dependencies
RUN npm ci --only=production

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
