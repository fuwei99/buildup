#!/bin/bash

# Buildup 项目本地部署脚本
# 使用方法: ./deploy.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Buildup 项目部署脚本${NC}"
echo "=================================="

# 检查Docker和Docker Compose是否安装
command -v docker >/dev/null 2>&1 || { echo -e "${RED}错误: Docker 未安装${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}错误: Docker Compose 未安装${NC}"; exit 1; }

# 创建必要的目录
echo -e "${YELLOW}📁 创建必要的目录...${NC}"
mkdir -p auth data logs

# 复制环境变量文件（如果不存在）
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ 已创建 .env 文件，请根据需要修改配置${NC}"
    else
        echo -e "${RED}错误: .env.example 文件不存在${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env 文件已存在${NC}"
fi

# 检查必要的文件
echo -e "${YELLOW}🔍 检查必要的文件...${NC}"
required_files=("Dockerfile" "unified-server.js" "package.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}错误: 缺少必要文件 $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ 所有必要文件检查通过${NC}"

# 停止现有容器（如果存在）
echo -e "${YELLOW}🛑 停止现有容器...${NC}"
docker-compose -f docker-compose.local.yml down || true

# 构建镜像
echo -e "${YELLOW}🔨 构建Docker镜像...${NC}"
docker-compose -f docker-compose.local.yml build --no-cache

# 启动服务
echo -e "${YELLOW}🚀 启动服务...${NC}"
docker-compose -f docker-compose.local.yml up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${YELLOW}🔍 检查服务状态...${NC}"
if docker-compose -f docker-compose.local.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 服务启动成功！${NC}"
    echo ""
    echo "服务访问地址: http://localhost:${PORT:-7860}"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose -f docker-compose.local.yml logs -f"
    echo "  停止服务: docker-compose -f docker-compose.local.yml down"
    echo "  重启服务: docker-compose -f docker-compose.local.yml restart"
    echo ""
else
    echo -e "${RED}❌ 服务启动失败${NC}"
    echo "查看错误日志:"
    docker-compose -f docker-compose.local.yml logs
    exit 1
fi

# 显示容器信息
echo -e "${YELLOW}📊 容器信息:${NC}"
docker-compose -f docker-compose.local.yml ps