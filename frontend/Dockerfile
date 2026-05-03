# Build from repository root (npm workspaces — root package-lock.json).
# Usage: docker compose build zerorespond-frontend

FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend ./frontend

RUN npm ci && npm run build -w frontend

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
