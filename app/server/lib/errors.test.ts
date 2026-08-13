import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import { env } from "cloudflare:test";
import { errorHandler, NotFoundError, ValidationError, DatabaseError } from "./errors";

describe("errorHandler", () => {
  const errorSpy = vi.spyOn(console, "error");

  beforeEach(() => {
    errorSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockReset();
  });

  it("should return AppError response with status and code", async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get("/missing", () => {
      throw new NotFoundError("Book not found");
    });

    const res = await app.request("/missing", {}, env);
    expect(res.status).toBe(404);

    const body = (await res.json()) as {
      success: boolean;
      error: { message: string; code: string };
    };
    expect(body).toEqual({
      success: false,
      error: {
        message: "Book not found",
        code: "NOT_FOUND",
      },
    });
  });

  it("should hide sensitive details in production", async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get("/db-error", () => {
      throw new DatabaseError("Query failed", { sql: "SELECT * FROM users" });
    });

    const prodEnv = { ...env, ENVIRONMENT: "production" };
    const res = await app.request("/db-error", {}, prodEnv);
    expect(res.status).toBe(500);

    const body = (await res.json()) as {
      error: { message: string; code: string; details?: unknown };
    };
    expect(body.error.message).toBe("Query failed");
    expect(body.error.code).toBe("DATABASE_ERROR");
    expect(body.error.details).toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith({
      event: "application_error",
      name: "DatabaseError",
      message: "Query failed",
      stack: expect.any(String),
    });
  });

  it("should hide sensitive details when environment is not configured", async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get("/db-error", () => {
      throw new DatabaseError("Query failed", { sql: "SELECT * FROM users" });
    });

    const res = await app.request("/db-error", {}, env);
    expect(res.status).toBe(500);

    const body = (await res.json()) as {
      error: { message: string; code: string; details?: unknown };
    };
    expect(body.error.details).toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith({
      event: "application_error",
      name: "DatabaseError",
      message: "Query failed",
      stack: expect.any(String),
    });
  });

  it("should expose sensitive details only in development", async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get("/db-error", () => {
      throw new DatabaseError("Query failed", { sql: "SELECT * FROM users" });
    });

    const developmentEnv = { ...env, ENVIRONMENT: "development" };
    const res = await app.request("/db-error", {}, developmentEnv);
    expect(res.status).toBe(500);

    const body = (await res.json()) as {
      error: { details?: unknown };
    };
    expect(body.error.details).toEqual({ sql: "SELECT * FROM users" });
    expect(errorSpy).toHaveBeenCalledWith({
      event: "application_error",
      name: "DatabaseError",
      message: "Query failed",
      stack: expect.any(String),
    });
  });

  it("should expose validation details in production", async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get("/validation-error", () => {
      throw new ValidationError("Invalid input", { field: "title" });
    });

    const prodEnv = { ...env, ENVIRONMENT: "production" };
    const res = await app.request("/validation-error", {}, prodEnv);
    expect(res.status).toBe(400);

    const body = (await res.json()) as {
      error: { message: string; code: string; details?: unknown };
    };
    expect(body.error.details).toEqual({ field: "title" });
  });

  it("should return generic 500 for unexpected errors", async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get("/unexpected", () => {
      throw new Error("boom");
    });

    const res = await app.request("/unexpected", {}, env);
    expect(res.status).toBe(500);

    const body = (await res.json()) as {
      error: { message: string; code: string };
    };
    expect(body).toEqual({
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
