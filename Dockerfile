#
# 🧑‍💻 Development
#
FROM public.ecr.aws/studiographene/node:20-alpine as dev
# add the missing shared libraries from alpine base image
RUN apk add --no-cache libc6-compat
# Create app folder
WORKDIR /app

# Set to dev environment
# ENV NODE_ENV dev

# Copy source code into app folder
COPY package*.json ./

# Install dependencies
RUN npm i

COPY --chown=node:node . .

USER node

#
# 🏡 Production Build
#
FROM public.ecr.aws/studiographene/node:20-alpine as build

WORKDIR /app
RUN apk add --no-cache libc6-compat

# Set to production environment
# ENV NODE_ENV production

# In order to run `npm run build` we need access to the Nest CLI.
# Nest CLI is a dev dependency.
COPY --chown=node:node --from=dev /app/node_modules ./node_modules
# Copy source code
COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN npm run build

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. 
# This ensures that the node_modules directory is as optimized as possible
RUN npm i && npm cache clean --force

USER node

#
# 🚀 Production Server
#
FROM public.ecr.aws/studiographene/node:20-alpine as prod

WORKDIR /app
RUN apk add --no-cache libc6-compat

# COPY ./mail-template ./mail-template
# Set to production environment
# ENV NODE_ENV production

# Create non-root user for Docker
RUN addgroup --system --gid 1001 executor
RUN adduser --system --uid 1001 executor

# Copy only the necessary files
COPY --chown=executor:executor --from=build /app/dist dist
COPY --chown=executor:executor --from=build /app/node_modules node_modules
COPY --chown=executor:executor --from=build /app/package.json package.json

# Set Docker as non-root user
USER executor

CMD node dist/main.js