# Use an official slim Node.js image for smaller size
FROM node:23-slim AS runner

WORKDIR /usr/src/app
COPY package.json package-lock.json ./  

RUN npm install --production             

COPY . .

RUN npm run build

EXPOSE 4000
CMD ["node", "dist/main"]

