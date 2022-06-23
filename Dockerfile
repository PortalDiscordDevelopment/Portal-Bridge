FROM node:18

WORKDIR /app

# Copy all necessary project files for build to /app
COPY . /app

# Prepare yarn 3.2.1
RUN corepack prepare yarn@3.2.1 --activate

# Install dependencies with yarn, caching ~/.yarn/berry/cache
RUN corepack yarn install --immutable

# Builds the project with tsc
RUN corepack yarn run build

# Starts the bot
CMD corepack yarn start:raw
