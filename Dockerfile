FROM --platform=linux/arm64 oven/bun

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Generate Prisma Client
RUN bunx prisma generate

# Copy rest of the application
COPY . .

EXPOSE 8000

CMD ["bun", "run", "start"]