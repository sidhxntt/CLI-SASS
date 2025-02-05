// Desc: User routes for the API

import { SubRoutes } from "./Sub_Routes";
import Data from "../utils/Data";
import JWT from "../controllers/Authentication";
import limiter from "../controllers/rate_limitter";
import { prisma } from "../utils/Prisma";

const createUserRoutes = () => {
  const auth = new JWT()
  const userRoutes = new SubRoutes();
  const user = new Data(prisma.user);

  userRoutes.endpoint("get", "/", user.getAll.bind(user), [auth.decryptJWT, limiter]);
  userRoutes.endpoint("get", "/:id", user.getOne.bind(user), [auth.decryptJWT, limiter]);
  userRoutes.endpoint("post", "/", user.Create.bind(user), [auth.decryptJWT, limiter]);
  userRoutes.endpoint("patch", "/:id", user.Update.bind(user), [auth.decryptJWT, limiter]);
  userRoutes.endpoint("delete", "/:id", user.Delete.bind(user), [auth.decryptJWT, limiter]);

  return userRoutes.getRouter();
};

const users = createUserRoutes();
export default users;
