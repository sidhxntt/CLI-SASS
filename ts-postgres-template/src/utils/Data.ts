// Purpose: Data class to handle CRUD operations on the database.

import { Request, Response } from "express";
import { redis_connection } from "./Clients/Redis";

const redis = redis_connection();
interface UserInput {
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  website: string;
}

interface ResponseBody<T> {
  status: string;
  message: string;
  data?: T;
  error?: string;
}

export default class Data {
  private readonly primary_model!: any;
  private readonly secondary_model?: any;

  constructor(model: any) {
    this.primary_model = model;
    this.secondary_model = model;
  }

  // Generate a cache key
  private generateCacheKey(page?: number, limit?: number, id?: number): string {
    if (id) {
      return `${this.primary_model.name}:${id}`;
    }
    return `${this.primary_model.name}:${page}:${limit}`;
  }

  // Changing ID type from string to number
  private TypeChangeOf_ID(req: Request) {
    const { id } = req.params;
    const parsedID = parseInt(id, 10);

    return parsedID;
  }

  // Generate Pagination Parameter
  private generatePagination(req: Request): {
    page: number;
    limit: number;
    offset: number;
  } {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }

  // Standardized Response
  protected sendResponse<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    error?: string
  ): Response {
    const response: ResponseBody<T> = {
      status: statusCode >= 400 ? "error" : "success",
      message,
      data,
      error,
    };

    return res.status(statusCode).json(response);
  }

  // Fetch all data
  public async getAll(req: Request, res: Response) {
    const { page, limit, offset } = this.generatePagination(req);
    const cacheKey = this.generateCacheKey(page, limit);

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        return this.sendResponse(
          res,
          200,
          "Data fetched successfully",
          parsedData
        );
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }

    const users = await this.primary_model.findMany({
      skip: offset,
      take: limit,
    });

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
    return this.sendResponse(
      res,
      200,
      "Data fetched successfully",
      responseData
    );
  }

  // Fetch One data
  public async getOne(req: Request, res: Response) {
    const id = this.TypeChangeOf_ID(req);
    if (isNaN(id)) {
      return this.sendResponse(
        res,
        400,
        "Invalid user ID",
        undefined,
        "Invalid ID"
      );
    }
    
    const cacheKey = this.generateCacheKey(id);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        return this.sendResponse(
          res,
          200,
          "Data fetched successfully",
          parsedData
        );
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }

    const user = await this.primary_model.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return this.sendResponse(
        res,
        404,
        "User not found",
        undefined,
        "User not found"
      );
    }
    await redis.setex(cacheKey, 3600, JSON.stringify(user));
    console.info("Single Data fetched successfully");
    return this.sendResponse(res, 200, "User fetched successfully", user);
  }

  // Create Data
  public async Create(req: Request, res: Response) {
    const { name, username, email, address, phone, website } =
      req.body as UserInput;
    if (!name || !username || !email || !address) {
      return this.sendResponse(
        res,
        400,
        "Missing required fields",
        undefined,
        "Missing fields"
      );
    }

    const existingUser = await this.primary_model.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return this.sendResponse(
        res,
        400,
        "User already exists",
        undefined,
        "User exists"
      );
    }

    const User = await this.primary_model.create({
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
    return this.sendResponse(
      res,
      201,
      "User & related address created successfully",
      {
        user: User,
        user_address: address,
      }
    );
  }

  // Update Data
  public async Update(req: Request, res: Response) {
    const id = this.TypeChangeOf_ID(req);
    const { name, username, email, address, phone, website } =
      req.body as UserInput;

    if (isNaN(id)) {
      return this.sendResponse(
        res,
        400,
        "Invalid user ID",
        undefined,
        "Invalid ID"
      );
    }

    const user = await this.primary_model.update({
      where: {
        id,
      },
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
      return this.sendResponse(
        res,
        404,
        "User not found",
        undefined,
        "User not found"
      );
    }
    console.info("Data updated successfully");
    return this.sendResponse(res, 200, "User updated successfully", {
      user: user,
      user_address: address,
    });
  }

  // Delete Data
  public async Delete(req: Request, res: Response) {
    const id = this.TypeChangeOf_ID(req);

    if (isNaN(id)) {
      return this.sendResponse(
        res,
        400,
        "Invalid user ID",
        undefined,
        "Invalid ID"
      );
    }

    const user = await this.primary_model.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      return this.sendResponse(
        res,
        404,
        "User not found",
        undefined,
        "User not found"
      );
    }

    await this.secondary_model.deleteMany({
      where: { id },
    });

    await this.primary_model.delete({
      where: { id },
    });

    console.info("Data deleted successfully");
    return this.sendResponse(
      res,
      200,
      "User & related address deleted successfully"
    );
  }
}
