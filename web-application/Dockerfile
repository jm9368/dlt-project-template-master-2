FROM node:20-alpine

# Add FFmpeg

RUN apk add --no-cache ffmpeg

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

# Create folders

RUN mkdir /backend
RUN mkdir /frontend

# Install backend dependencies

ADD ./backend/package.json /backend/package.json
ADD ./backend/package-lock.json /backend/package-lock.json

WORKDIR /backend

RUN npm install

# Install frontend dependencies

ADD ./frontend/package.json /frontend/package.json
ADD ./frontend/package-lock.json /frontend/package-lock.json

WORKDIR /frontend

RUN npm install

# Copy and build backend

COPY backend/. /backend/.

WORKDIR /backend

RUN npm run build

# Copy frontend

COPY frontend/. /frontend/.

ENV FRONTEND_PATH=/frontend/dist

# Copy startup script

COPY docker-startup.sh /bin/docker-startup.sh
RUN chmod +x /bin/docker-startup.sh

# Env

ENV NODE_ENV=production

# Expose

EXPOSE 80
EXPOSE 443

# Entry

ENTRYPOINT [ "/bin/docker-startup.sh" ]
