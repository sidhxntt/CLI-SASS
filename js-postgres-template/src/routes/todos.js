// Purpose: Handle all routes related to the todos endpoint.

import { SubRoutes } from "./Sub_Routes";
import Data from "../utils/Data";
import JWT from "../controllers/Authentication";
import limiter from "../controllers/rate_limitter";
import { prisma } from "../utils/Prisma";


const createUserRoutes = () => {
  
  const auth = new JWT();
  const todosRoutes = new SubRoutes();
  const todos = new Data(prisma.todos);

  todosRoutes.endpoint("get", "/", todos.getAll.bind(todos), [auth.decryptJWT, limiter]);
  todosRoutes.endpoint("get", "/:id", todos.getOne.bind(todos), [auth.decryptJWT, limiter]);

  return todosRoutes.getRouter();
};

const todos = createUserRoutes();
export default todos;
