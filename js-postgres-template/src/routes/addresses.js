// Init router and data controller for the address route 

import { SubRoutes } from "./Sub_Routes";
import Data from "../utils/Data";
import JWT from "../controllers/Authentication";
import limiter from "../controllers/rate_limitter";
import { prisma } from "../utils/Prisma";

const createUserRoutes = () => {

    const auth = new JWT();
    const addressRoutes = new SubRoutes();
    const address = new Data(prisma.address)

    addressRoutes.endpoint('get', '/', address.getAll.bind(address), [auth.decryptJWT, limiter]);
    addressRoutes.endpoint('get', '/:id', address.getOne.bind(address), [auth.decryptJWT, limiter]);

    return addressRoutes.getRouter();
};

const users = createUserRoutes()
export default users;