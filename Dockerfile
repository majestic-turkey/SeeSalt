# Build client
FROM node:24-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json .
RUN npm ci
COPY client/ .
RUN npm run build

# Install server deps
FROM node:24-alpine AS server-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json .
RUN npm ci --omit=dev

# Run the thing
FROM node:24-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app/server
COPY server/ .
COPY --from=server-deps /app/server/node_modules ./node_modules
COPY --from=client-build /app/client/dist ../client/dist
USER node
EXPOSE 3000
CMD ["node", "index.ts"]