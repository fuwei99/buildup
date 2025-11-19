# 使用官方的 Node.js 18 slim 版本作为基础镜像
FROM node:18-slim

# 安装必要的系统依赖（用于无头浏览器 camoufox）
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

# 创建一个非 root 用户并设置工作目录
RUN useradd -m -s /bin/bash user
WORKDIR /home/user

# 先复制 package.json 和 package-lock.json 来利用 Docker 的缓存机制
COPY package*.json ./
# 安装项目依赖
RUN npm install

# 复制所有应用文件和文件夹到工作目录
COPY unified-server.js black-browser.js models.json config.json ./ # <--- 修正并合并了所有需要复制的单个文件
COPY auth/ ./auth/
COPY camoufox-linux/ ./camoufox-linux/
COPY public/ ./public/

# 更改文件所有权，并给 camoufox 添加可执行权限
RUN chown -R user:user /home/user && \
    chmod +x /home/user/camoufox-linux/camoufox

# 切换到创建的非 root 用户
USER user

# 声明容器对外暴露的端口
EXPOSE 8889

# 定义容器启动时执行的命令
CMD ["node", "unified-server.js"]
