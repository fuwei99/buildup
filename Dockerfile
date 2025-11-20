FROM node:18-slim

RUN apt-get update && apt-get install -y \
    wget \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# 下载并安装 camoufox
RUN wget -O camoufox.tar.gz "https://github.com/daijro/camoufox/releases/latest/download/camoufox-linux.tar.gz" \
    && tar -xzf camoufox.tar.gz \
    && mv camoufox-linux /home/user/ \
    && rm camoufox.tar.gz

RUN useradd -m -s /bin/bash user
WORKDIR /home/user

COPY package*.json ./
RUN npm install

COPY unified-server.js black-browser.js models.json config.json ./
COPY auth/ ./auth/
COPY single-line-auth/ ./single-line-auth/
COPY public/ ./public/

RUN chown -R user:user /home/user && \
    chmod +x /home/user/camoufox-linux/camoufox

USER user

EXPOSE 7860

CMD ["node", "unified-server.js"]
