// Purpose: Data class to handle CRUD operations on the database.

import { redis_connection } from "./Redis";

const redis = redis_connection();

export default class Data {
  constructor(model) {
    this.primary_model = model;
    this.secondary_model = model;
  }

  // Generate a cache key
  generateCacheKey(page, limit, id) {
    if (id) {
      return `${this.primary_model.name}:${id}`;
    }
    return `${this.primary_model.name}:${page}:${limit}`;
  }

  // Changing ID type from string to number
  TypeChangeOf_ID(req) {
    const { id } = req.params;
    return parseInt(id, 10);
  }

  // Generate Pagination Parameters
  generatePagination(req) {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }

  // Standardized Response
  sendResponse(res, statusCode, message, data, error) {
    const response = {
      status: statusCode >= 400 ? "error" : "success",
      message,
      data,
      error,
    };

    return res.status(statusCode).json(response);
  }

  // Fetch all data
  async getAll(req, res) {
    const { page, limit, offset } = this.generatePagination(req);
    const cacheKey = this.generateCacheKey(page, limit);

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      try {
        return this.sendResponse(res, 200, "Data fetched successfully", JSON.parse(cachedData));
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }

    const users = await this.primary_model.findMany({ skip: offset, take: limit });
    const totalUsers = await this.primary_model.count();

    const responseData = {
      meta: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
      data: users,
    };

    await redis.setex(cacheKey, 3600, JSON.stringify(responseData));

    console.info("All Data fetched successfully");
    return this.sendResponse(res, 200, "Data fetched successfully", responseData);
  }

  // Fetch single data
  async getOne(req, res) {
    const id = this.TypeChangeOf_ID(req);
    if (isNaN(id)) {
      return this.sendResponse(res, 400, "Invalid user ID", undefined, "Invalid ID");
    }

    const cacheKey = this.generateCacheKey(id);
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      try {
        return this.sendResponse(res, 200, "Data fetched successfully", JSON.parse(cachedData));
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }

    const user = await this.primary_model.findUnique({ where: { id } });
    if (!user) {
      return this.sendResponse(res, 404, "User not found", undefined, "User not found");
    }

    await redis.setex(cacheKey, 3600, JSON.stringify(user));
    console.info("Single Data fetched successfully");
    return this.sendResponse(res, 200, "User fetched successfully", user);
  }

  // Create Data
  async Create(req, res) {
    const { name, username, email, address, phone, website } = req.body;
    if (!name || !username || !email || !address) {
      return this.sendResponse(res, 400, "Missing required fields", undefined, "Missing fields");
    }

    const existingUser = await this.primary_model.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return this.sendResponse(res, 400, "User already exists", undefined, "User exists");
    }

    const user = await this.primary_model.create({
      data: {
        name,
        username,
        email,
        phone,
        website,
        address: {
          create: {
            street: address.street,
            suite: address.suite,
            city: address.city,
            zipcode: address.zipcode,
          },
        },
      },
    });

    console.info("Data created successfully");
    return this.sendResponse(res, 201, "User & related address created successfully", {
      user,
      user_address: address,
    });
  }

  // Update Data
  async Update(req, res) {
    const id = this.TypeChangeOf_ID(req);
    const { name, username, email, address, phone, website } = req.body;

    if (isNaN(id)) {
      return this.sendResponse(res, 400, "Invalid user ID", undefined, "Invalid ID");
    }

    const user = await this.primary_model.update({
      where: { id },
      data: {
        name,
        username,
        email,
        phone,
        website,
        address: {
          upsert: {
            create: {
              street: address?.street,
              suite: address?.suite,
              city: address?.city,
              zipcode: address?.zipcode,
            },
            update: {
              street: address?.street,
              suite: address?.suite,
              city: address?.city,
              zipcode: address?.zipcode,
            },
          },
        },
      },
    });

    if (!user) {
      return this.sendResponse(res, 404, "User not found", undefined, "User not found");
    }

    console.info("Data updated successfully");
    return this.sendResponse(res, 200, "User updated successfully", {
      user,
      user_address: address,
    });
  }

  // Delete Data
  async Delete(req, res) {
    const id = this.TypeChangeOf_ID(req);

    if (isNaN(id)) {
      return this.sendResponse(res, 400, "Invalid user ID", undefined, "Invalid ID");
    }

    const user = await this.primary_model.findUnique({ where: { id } });
    if (!user) {
      return this.sendResponse(res, 404, "User not found", undefined, "User not found");
    }

    await this.secondary_model.deleteMany({ where: { id } });
    await this.primary_model.delete({ where: { id } });

    console.info("Data deleted successfully");
    return this.sendResponse(res, 200, "User & related address deleted successfully");
  }
}
