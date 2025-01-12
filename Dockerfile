FROM --platform=linux/arm64 oven/bun

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY .env ./.env
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Generate Prisma Client
RUN bunx prisma generate

# Copy rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads

EXPOSE 8000

CMD ["bun", "run", "start"]