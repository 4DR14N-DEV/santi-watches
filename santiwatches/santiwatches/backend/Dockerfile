FROM node:22-slim

WORKDIR /app

# Copiar solo lo necesario para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código
COPY . .

# Puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]
