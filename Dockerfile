# step 1: build sveltekit app
FROM node:24-bookworm AS builder
WORKDIR /app
COPY . .
RUN npm install --include=dev

ARG ORIGIN=http://localhost:3000

ENV NODE_ENV=production
ENV ORIGIN=${ORIGIN}
ENV BODY_SIZE_LIMIT=1000000
ENV DATABASE_URL=file:/app/data/db.sqlite
RUN npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev

# step 2: copy sveltekit build output to a new image
FROM node:24-bookworm
WORKDIR /app
RUN mkdir data/
VOLUME data/
COPY --from=builder /app/build build/
COPY --from=builder /app/static static/
COPY --from=builder /app/generated/prisma generated/prisma/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/server.js server.js

ARG ORIGIN=http://localhost:3000

# step 3: start the server
ENV NODE_ENV=production
ENV ORIGIN=${ORIGIN}
ENV BODY_SIZE_LIMIT=1000000
ENV DATABASE_URL=file:/app/data/db.sqlite

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]