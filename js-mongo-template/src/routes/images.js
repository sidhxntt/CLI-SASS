// Desc: Images routes

import { SubRoutes } from "./Sub_Routes.js";
import Data from "../utils/Data.js";
import JWT from "../controllers/Authentication.js";
import limiter from "../controllers/rate_limitter.js";
import { prisma } from "../utils/client/Prisma.js";

const createUserRoutes = () => {

    const auth = new JWT();
    const imagesRoutes = new SubRoutes();
    const images = new Data(prisma.image)

    imagesRoutes.endpoint('get', '/', images.getAll.bind(images), [auth.decryptJWT, limiter]);
    imagesRoutes.endpoint('get', '/:id', images.getOne.bind(images), [auth.decryptJWT, limiter]);

    return imagesRoutes.getRouter();
};

const images = createUserRoutes()
export default images;