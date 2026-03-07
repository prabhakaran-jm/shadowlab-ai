# ShadowLab frontend – optional Docker dev image
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]
