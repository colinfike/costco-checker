FROM node:latest

WORKDIR /app
COPY . /app/

# Pass in secrets when generating image. Ideally use AWS Secret Manager for this but you know.
ARG GMAIL_API_CLIENT_ID
ARG GMAIL_API_CLIENT_SECRET
ARG GMAIL_REFRESH_TOKEN

ENV GMAIL_API_CLIENT_ID=$GMAIL_API_CLIENT_ID
ENV GMAIL_API_CLIENT_SECRET=$GMAIL_API_CLIENT_SECRET
ENV GMAIL_REFRESH_TOKEN=$GMAIL_REFRESH_TOKEN

RUN npm install -g ts-node && npm install && npx playwright install && npx playwright install-deps

CMD ts-node main.ts
