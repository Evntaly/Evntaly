FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* .npmrc ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production --base-href /

FROM nginx:alpine

COPY --from=build /app/dist/evntaly-portal/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
