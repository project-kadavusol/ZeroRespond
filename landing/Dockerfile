# Build from repository root (npm workspaces — root package-lock.json).
# Usage: docker compose build zerorespond-landing

FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend ./frontend
COPY landing ./landing

RUN npm ci && npm run build -w landing

FROM nginx:alpine

COPY landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/landing/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
