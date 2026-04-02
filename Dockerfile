FROM mcr.microsoft.com/playwright:v1.51.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx playwright install --with-deps chromium

CMD ["npx", "playwright", "test", "--reporter=line"]