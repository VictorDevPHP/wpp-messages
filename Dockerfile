# Use a imagem oficial do Node.js como base
FROM node:20.3.0

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instale as dependências necessárias
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Instale o Node.js globalmente para poder usá-lo em todos os contêineres
RUN npm install -g @wppconnect-team/wppconnect

# Copie o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Instale a dependência @img/sharp-win32-x64
RUN npm install @img/sharp-win32-x64 --save-optional

# Instale o chromedriver
RUN npm install chromedriver

# Copie todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Compile o código TypeScript
RUN npm run build

# Exponha a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
