FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build
RUN echo "=== Conteudo de /app/dist ===" && ls -la /app/dist/ && echo "=== main.js ===" && ls /app/dist/main.js

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node /app/dist/main"]
