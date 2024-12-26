# Backend

This is the backend for a curriculum builder project: a modular and free-to-use resume builder designed for individuals, allowing them to create, share, and download their resumes while featuring integrated social interaction.

## Tech Stack

### Base

[<img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white">](https://nodejs.org/en)
[<img src="https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white">](https://yarnpkg.com/)
[<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white">](https://www.typescriptlang.org/)
[<img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB">](https://expressjs.com/)

### Database

[<img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white">](https://www.postgresql.org/)
[<img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white">](https://www.prisma.io/)

### Test

[<img src="https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white">](https://jestjs.io/)
[<img src="https://img.shields.io/badge/Babel-F9DC3e?style=for-the-badge&logo=babel&logoColor=black">](https://babeljs.io/)

- [supertest](https://ladjs.github.io/superagent/) 😎

### Linting and Formatting

[<img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white">](https://eslint.org/)
[<img src="https://img.shields.io/badge/prettier-%23F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black">](https://prettier.io/)

### Development

[<img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white">](https://github.com/)
[<img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white">](https://www.docker.com/)
[<img src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white">](https://code.visualstudio.com/)

### Others

[<img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens">](https://jwt.io/)
[<img src="https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white">](https://zod.dev/)

- [Argon2](https://www.argon2.com/) 🔐
- [Faker](https://fakerjs.dev/) 🪄
- [Husky](https://typicode.github.io/husky/) 🐶
- [Nodemailer](https://www.nodemailer.com/) 💌

### Recommended extensions for VS Code

- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) ✍️
- [Docker](https://code.visualstudio.com/docs/containers/overview) 🐳
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) 🛠️
- [GitHub Pull Requests](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) 🔗
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) 🔍
- [Postman](https://marketplace.visualstudio.com/items?itemName=Postman.postman-for-vscode) 📫
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) 🎨
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) 📊
- [WSL](https://code.visualstudio.com/docs/remote/wsl) 🖥️

> [!NOTE]
> We strongly recommend using the Windows Subsystem Linux (WSL) for development.

## How to start

> [!IMPORTANT]
> Before we start, you need to have Docker set up and running.

1. Clone this repository using git
2. Create a `.env.local` file with the following content in the root of your folder:

   ```
   PORT="8080"
   PROJECT_NAME="Modular CV"
   DOMAIN="http://localhost:8080"
   TOKEN_SECRET="Secret"
   PEPPER_SECRET="Secret"
   NODE_MAILER_SERVICE="your email provider"
   NODE_MAILER_USER="your email"
   NODE_MAILER_PASS="your app password"
   NODE_MAILER_SENDER="your email"
   ```

3. Create a `.env` file with the following content in the root of your folder:

   ```
   DATABASE_URL="postgresql://admin:admin@localhost:5432/cv?schema=public"
   ```

4. In your terminal:
   1. `yarn install`
   2. `yarn compose:up`
   3. `yarn dev`
   4. Done!🫖
