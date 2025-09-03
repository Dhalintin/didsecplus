# 🚀 Bias Free Job Board  Api

A modern Node.js application built with TypeScript for improved type safety, maintainability, and scalability.

##  Features

-  Built with TypeScript
-  Express.js server
-  RESTful API structure
-  Middleware support
-  Environment-based configuration
-  Pino logger for logging
-  Modular and scalable folder structure

---

##  Project Structure

### 📁 Project Structure

```text
project-root/
├── dist/                   # Compiled JavaScript output
├── node_modules/           # Project dependencies
├── prisma/                 # Prisma ORM schema
│   └── schema.prisma
├── src/                    # Application source code
│   ├── configs/            # Environment and app configuration
│   ├── features/           # Modular features (e.g. auth, users)
│   │   └── authentication/ # Auth-related logic and controllers
│   ├── lib/                # External utilities or shared services
│   ├── middlewares/        # Express middlewares (auth, error, etc.)
│   ├── utils/              # Helper functions and utilities
│   ├── validations/        # Request/response validation schemas
│   ├── appRoute.ts         # Route definitions
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Application entry point
├── .env                    # Local environment configuration
├── .env.example            # Example environment configuration
├── .gitignore              # Git ignored files
├── package.json            # NPM project metadata and scripts
├── package-lock.json       # Exact dependency versions
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```





##  Setup

### 1 Clone the repo

git clone https://github.com/Bias-free-job-board/Api.git



## Install Dependecies 
npm install

## Environment variables
- Create a .env file in the root with your configuration. Example:
    PORT=5000
    NODE_ENV=development
    DB_URI=mongodb://localhost:27017/mydb
    JWT_SECRET=your_jwt_secret


 ## Run the app
   ### Development
     npm run dev

   ### Production
     npm run build
    npm start

## Technologies Used
- Node.js

- TypeScript

- Express

- Prisma (with MongoDB)



## License


 ## Authors
  Uche Ali And Darlington
  [Visit my GitHub](https://github.com/solowiseCv)


