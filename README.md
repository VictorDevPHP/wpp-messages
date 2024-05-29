# Documentação do Projeto

## Índice

1. [Descrição](#descrição)
2. [Instalação](#instalação)
3. [Executando o aplicativo](#executando-o-aplicativo)
4. [Testes](#testes)
5. [Endpoints](#endpoints)
6. [Autenticação](#autenticação)
7. [Configuração do Arquivo .env](#configuração-do-arquivo-env)
## Descrição

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Instalação

```bash
$ npm install
```

### Instalar node v20

### Instalar sharp 

```bash
#instale com -g --include=optional
npm install -g --include=optional sharp
```

### No servidor Instale o Chromium 

```bash
apt-get install chromium-browser
```

## Executando o aplicativo

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Execute npm run build e pm2 restart para cada alteração

```bash
npm run build
pm2 restart nome_do_serviço
```

## Testes

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Endpoints

### `GET /wppconnect/connect`

Este endpoint inicia uma conexão com o serviço WppConnect.

**Resposta**: Não retorna nenhum corpo de resposta.

### `GET /wppconnect/qr`

Este endpoint retorna uma página HTML com um QR Code que pode ser escaneado pelo WhatsApp para estabelecer uma conexão.

**Resposta**: Retorna uma página HTML com o QR Code.

### `POST /wppconnect/sendMessage`

Este endpoint envia uma mensagem através do serviço WppConnect.

**Parâmetros do corpo**:

- `phone`: O número de telefone para o qual a mensagem será enviada.
- `text`: O texto da mensagem a ser enviada.

**Resposta**: A resposta depende do serviço WppConnect.

### `GET /wppconnect/sendMessage`

Este endpoint retorna uma mensagem informando que o método POST deve ser usado para enviar uma mensagem.

**Resposta**: Retorna um objeto JSON com a chave `message`.

Exemplo de resposta:
```json
{
  "message": "Please use POST method to send a message"
}
```

## Autenticação

### Autenticação via Chave

Nossa API utiliza um método de autenticação baseado em uma chave numérica calculada a partir da data atual. A chave é calculada multiplicando o dia, mês e ano da data atual.

#### Como calcular a chave

1. Pegue a data atual.
2. Multiplique o dia, mês (incrementado em 1) e ano para obter a chave.

Por exemplo, se a data atual for 2 de janeiro de 2023, a chave será calculada como:

```
2 (dia) * 1 (mês de janeiro, incrementado em 1) * 2023 (ano) = 4046
```

#### Como usar a chave

Ao fazer uma solicitação para a API, inclua a chave no corpo da solicitação. Por exemplo:

```json
{
  "phone": "1234567890",
  "text": "Hello, world!",
  "key": 4046
}
```

#### Respostas de autenticação

Se a chave não for fornecida ou se a chave fornecida não corresponder à chave calculada no servidor, a API retornará uma resposta com `success: false` e uma mensagem de erro.

Exemplo de resposta quando a chave não é fornecida:

```json
{
  "success": false,
  "message": "Key not provided"
}
```

Exemplo de resposta quando a chave é inválida:

```json
{
  "success": false,
  "message": "Invalid key"
}
```

Se a autenticação for bem-sucedida, a API processará a solicitação e retornará a resposta apropriada.

# Configuração do Arquivo .env

O arquivo `.env` é usado para definir variáveis de ambiente que são usadas pelo aplicativo. Aqui estão as variáveis que você precisa definir:

## Como Configurar

Para configurar essas variáveis, crie um arquivo chamado `.env` na raiz do seu projeto e adicione as seguintes linhas:

```properties
DOMAIN='seu_dominio'
API_KEY='sua_chave_de_api'
```

Substitua `'seu_dominio'` e `'sua_chave_de_api'` pelos valores apropriados.

Depois de criar e configurar o arquivo `.env`, o aplicativo usará essas variáveis de ambiente quando for executado.