<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Instalar node v20

## Instalar sharp 
```bash
#instale com -g --include=optional
npm install -g --include=optional sharp
```
## No servidor Instale o Chromium 
```bash
apt-get install chromium-browser
```
## Execute npm run build e pm2 restart para cada alteração
## No servidor Instale o Chromium 
```bash
npm run build
pm2 restart nome_do_serviço
```

# Endpoints

### 1. Connect to WhatsApp

- **Endpoint:** `/whatsapp/connect`
- **Method:** `GET`
- **Description:** Establishes a connection to WhatsApp.

#### Request

```http
GET /wppconnect/connect HTTP/1.1
```
#### Aguarde o QRCode no log do pm2(pm2 logs), no log do npm run start
### Response
Code: 200 OK
Body:
```json
  "success": true,
  "message": "WhatsApp connected successfully"
```
Code: 500 Internal Server Error
Body:
```json
  "success": false,
  "error": "Failed to connect to WhatsApp"
```

### 2. Send Message
```bash
curl -X POST http://localhost:3000/wppconnect/sendMessage -H "Content-Type: application/json" -d '{"phone": "numero", "message": "Sua mensagem aqui"}'
```
Code: 200 OK
Body:
```json
  "success": true,
  "result": "Message sent successfully"
```
Code: 400 Bad Request

Body:
```json
  "success": false,
  "error": "Phone and message are required"
```
Code: 500 Internal Server Error

Body:
```json
  "success": false,
  "error": "Failed to send message"
```
