FROM node:alpine

RUN apk --no-cache add postgresql-client
RUN npm install -g nodemon

#ARG USER
#ARG USER_ID
#ARG GROUP_ID

#RUN addgroup --gid $GROUP_ID $USER
#RUN adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID $USER
#WORKDIR /home/$USER
#USER $USER

WORKDIR /home/node
USER node

#RUN yarn
