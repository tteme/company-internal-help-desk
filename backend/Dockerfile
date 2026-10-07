FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN DATABASE_URL="postgresql://postgres:dummy@localhost:5432/digaf_helpdesk" npx prisma generate

COPY src ./src
COPY server.js ./

EXPOSE 5000

CMD ["npm", "start"]