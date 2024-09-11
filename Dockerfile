FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma Clientを生成
RUN npx prisma generate

RUN npm run build

CMD ["npm", "start"]