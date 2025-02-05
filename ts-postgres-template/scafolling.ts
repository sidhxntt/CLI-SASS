// import fs  from 'fs';
// import path  from 'path';
// import { execSync } from 'child_process';

// // Directory structure to create
// const directories = [
//   'src/controllers',
//   'src/models',
//   'src/routes',
//   'src/utils/workers',
//   'prisma/seeding'
// ];

// // Files to copy from template
// const files = {
//   'src/server.ts': `import express from 'express';
// const app = express();
// // Your server code here
// `,
//   'src/utils/workers/email.ts': `// Email worker implementation`,
//   'src/utils/workers/sms.ts': `// SMS worker implementation`,
//   'prisma/schema.prisma': `// Prisma schema`,
//   'prisma/seeding/data.ts': `// Seeding data`,
//   '.env.example': `DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
// REDIS_URL="redis://localhost:6379"
// `,
//   'ecosystem.config.js': `module.exports = {
//   apps: [{
//     name: 'rishu_ts_template',
//     script: './dist/server.js',
//     instances: 'max',
//     exec_mode: 'cluster'
//   }]
// }`,
//   'tsconfig.json': `{
//   "compilerOptions": {
//     "target": "ES2020",
//     "module": "commonjs",
//     "outDir": "./dist",
//     "rootDir": "./src",
//     "strict": true
//   }
// }`,
//   'docker-compose.yml': `version: '3'
// services:
//   app:
//     build: .
//     ports:
//       - "3000:3000"
// `,
//   'Dockerfile': `FROM node:18
// WORKDIR /app
// COPY package*.json ./
// RUN npm install
// COPY . .
// RUN npm run build
// CMD ["npm", "run", "prod:server"]
// `
// };

// function createProjectStructure() {
//   const projectName = process.argv[2] || 'my-ts-project';
//   const projectPath = path.join(process.cwd(), projectName);

//   // Create project directory
//   fs.mkdirSync(projectPath, { recursive: true });
//   process.chdir(projectPath);

//   // Create directories
//   directories.forEach(dir => {
//     fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
//   });

//   // Create files
//   Object.entries(files).forEach(([filename, content]) => {
//     fs.writeFileSync(path.join(projectPath, filename), content);
//   });

//   // Copy package.json and modify it
//   const packageJson = require('../package.json');
//   const newPackageJson = {
//     name: projectName,
//     version: '1.0.0',
//     main: 'src/server.ts',
//     scripts: packageJson.scripts,
//     dependencies: packageJson.dependencies,
//     devDependencies: packageJson.devDependencies
//   };

//   fs.writeFileSync(
//     path.join(projectPath, 'package.json'),
//     JSON.stringify(newPackageJson, null, 2)
//   );

//   // Initialize git
//   execSync('git init');

//   console.log(`Project ${projectName} created successfully!`);
//   console.log('To get started:');
//   console.log(`cd ${projectName}`);
//   console.log('npm install');
//   console.log('npm run dev:server');
// }

// createProjectStructure();