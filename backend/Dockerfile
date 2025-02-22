# Use an official Node.js runtime as the base image
FROM node:22.6-alpine
WORKDIR /usr/src/app
COPY backend/package.json ./
RUN npm install
COPY backend/ .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
