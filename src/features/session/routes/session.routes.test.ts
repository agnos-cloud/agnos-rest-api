import request from "supertest";
import app from "@app";
import { connect, disconnect } from "@utils/connect";
import { INVALID_ACCESS_TOKEN } from "@constants/errors";
import PermissionModel from "../../../models/permission.model";
import { Request, Response, NextFunction } from "express";

jest.mock("@middleware/checkAuth0IdToken", () => (_: Request, __: Response, next: NextFunction) => {
  return next();
});

describe("Session routes", () => {
  beforeAll(async () => {
    await connect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await PermissionModel.collection.drop();
    await disconnect();
  });

  describe("POST /sessions", () => {
    it("should return 400 if the request body has missing field (e.g. idToken)", async () => {
      const body = {
        email: "test@example.com",
        accessToken: "valid-access-token",
      };
      const response = await request(app).post("/sessions").send(body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.name).toBeDefined();
      expect(response.body.error.name).toBe("ZodError");
    });

    it("should return 401 if the user cannot be found", async () => {
      const body = {
        email: "test@example.com",
        accessToken: "valid-access-token",
        idToken: "test-id-token",
      };
      const response = await request(app).post("/sessions").send(body);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBeDefined();
      expect(response.body.error.message).toBe(INVALID_ACCESS_TOKEN);
    });

    // it("should create a session for a valid user", async () => {
    //   const body = {
    //     email: "test@example.com",
    //     accessToken: "valid-access-token",
    //   };
    //   const response = await request(app).post("/sessions").send(body);
    //   expect(response.status).toBe(200);
    //   expect(response.body.data).toHaveProperty("_id");
    //   expect(response.body.data).toHaveProperty("user");
    //   expect(response.body.data.email).toBe(body.email);
    //   expect(response.body.data.accessToken).toBe(body.accessToken);
    // });
  });
});
