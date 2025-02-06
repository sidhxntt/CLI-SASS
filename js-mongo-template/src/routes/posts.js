// Desc: Post routes for the API

import { SubRoutes } from "./Sub_Routes.js";
import Data from "../utils/Data.js";
import JWT from "../controllers/Authentication.js";
import limiter from "../controllers/rate_limitter.js";
import { prisma } from "../utils/client/Prisma.js";

const createUserRoutes = () => {

    const auth = new JWT();
    const postRoutes = new SubRoutes();
    const posts = new Data(prisma.post)

    postRoutes.endpoint('get', '/', posts.getAll.bind(posts), [auth.decryptJWT, limiter]);
    postRoutes.endpoint('get', '/:id', posts.getOne.bind(posts), [auth.decryptJWT, limiter]);

    return postRoutes.getRouter();
};

const post = createUserRoutes()
export default post;