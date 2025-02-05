// Purpose: Handle all routes related to albums endpoint.

import { SubRoutes } from "./Sub_Routes.js";
import Data from "../utils/Data.js";
import JWT from "../controllers/Authentication.js";
import limiter from "../controllers/rate_limitter.js";
import { prisma } from "../utils/client/Prisma.js";


const createUserRoutes = () => {
    const auth = new JWT();
    const albumRoutes = new SubRoutes();
    const albums = new Data(prisma.album)

    albumRoutes.endpoint('get', '/', albums.getAll.bind(albums), [auth.decryptJWT, limiter]);
    albumRoutes.endpoint('get', '/:id', albums.getOne.bind(albums), [auth.decryptJWT, limiter]);
    
    return albumRoutes.getRouter();
};

const users = createUserRoutes()
export default users;