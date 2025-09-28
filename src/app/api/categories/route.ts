// src/app/api/categories/route.ts
import { NextRequest } from "next/server";
import {
  categoriesApiRequest,
  getTokenFromRequest,
  successResponse,
  errorResponse,
} from "@/lib/categories";

// Define a custom error type that may include a status code
interface CustomError extends Error {
  status?: number;
}

/** 
 * Helper to safely extract error messages from unknown errors
 */
function getErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    const customError = error as CustomError;
    const status = customError.status ?? 500;
    return { message: customError.message, status };
  }
  return { message: String(error), status: 500 };
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    const data = await categoriesApiRequest("/categories", { token });
    return successResponse(data);
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return errorResponse(message, status);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    const body: Record<string, unknown> = await req.json(); // safer typing instead of any
    const data = await categoriesApiRequest("/categories", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
    return successResponse(data, 201);
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return errorResponse(message, status);
  }
}
