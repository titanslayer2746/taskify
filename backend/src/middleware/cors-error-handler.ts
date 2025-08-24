import { Request, Response, NextFunction } from "express";

export const corsErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS Error: Origin not allowed",
      error: {
        type: "CORS_ERROR",
        details: `Origin ${req.headers.origin} is not allowed by CORS policy`,
        allowedOrigins:
          process.env.NODE_ENV === "development"
            ? process.env.CORS_ORIGIN_DEV?.split(",") || [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:8080",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:8080",
              ]
            : "Production origins configured in environment",
      },
    });
  }

  next(err);
};
