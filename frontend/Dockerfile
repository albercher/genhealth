FROM node:18-alpine

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Start the app with npm start for React
CMD ["npm", "start"]
