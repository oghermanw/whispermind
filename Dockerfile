FROM node:18-alpine

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用程式代碼
COPY . .

# 創建上傳目錄
RUN mkdir -p uploads

# 構建應用程式
RUN npm run build

# 暴露端口
EXPOSE 3009

# 啟動應用程式
CMD ["npm", "start"]
