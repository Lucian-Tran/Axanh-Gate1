FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=3100
ENV AUTH_DB_PATH=/app/data/auth.db

WORKDIR /app

COPY --chown=1107:100 package.json ./package.json
COPY --chown=1107:100 src ./src

RUN mkdir -p /app/data \
    && chown -R 1107:100 /app \
    && node --input-type=module -e "import('node:sqlite').then(() => console.log('SQLite available'))"

USER 1107:100

EXPOSE 3100

CMD ["node", "src/server.js"]
