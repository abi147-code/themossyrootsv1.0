FROM node:18-alpine AS build
ARG VITE_API_BASE
ARG VITE_GEMINI_API_KEY
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/invoice-generator
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
