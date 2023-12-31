## NODE PACKAGE AND DEPENDENCIES ##
# NODE VERSION USED IN DEVELOPMENT #
FROM node:16.20.2
# SET DIRECTORY TO /app IN IMAGE #
WORKDIR /app
# COPY NODE PACKAGES #
COPY package*.json ./
# INSTALL DEPENDENCIES #
RUN npm ci
RUN apt-get update -y && apt-get install -y iptables

## CUSTOM APPLICATION DATA AND FILES ##
# CREATE EMPTY DATA DIRS #
RUN mkdir data
RUN mkdir data/children
RUN mkdir data/tasks

# COPY DATA FOLDERS AND FILES #
COPY js/ ./js/
COPY pages/ ./pages/
COPY public/ ./public/
COPY routes/ ./routes/
COPY server/ ./server/
# COPY .ENV FILE #
COPY .env .env
# COPY server.js FILE #
COPY server.js server.js

## LAUNCH APPLICATION ##
USER 0
CMD ["npm","start","main"]