# syntax=docker/dockerfile:1
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY invoice-generator /usr/share/nginx/html/invoice-generator
