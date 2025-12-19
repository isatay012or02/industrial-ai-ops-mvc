FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Nginx для сервировки статики
FROM nginx:alpine

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Копируем собранное приложение
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]