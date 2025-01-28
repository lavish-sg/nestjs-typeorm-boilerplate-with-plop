# Install node dependencies and sync folders

FROM public.ecr.aws/studiographene/node:20-alpine as build
COPY . /var/app/ctl-api-service

WORKDIR /var/app/ctl-api-service
RUN npm install