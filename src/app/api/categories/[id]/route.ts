// src/app/api/categories/[id]/route.ts
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
 * Safely extracts error info from unknown values
 */
function getErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    const customError = error as CustomError;
    const status = customError.status ?? 500;
    return { message: customError.message, status };
  }
  return { message: String(error), status: 500 };
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    const { id } = await params;
    const data = await categoriesApiRequest(`/categories/${id}`, { token });
    return successResponse(data);
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return errorResponse(message, status);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    const { id } = await params;
    const body: Record<string, unknown> = await req.json(); 
    const data = await categoriesApiRequest(`/categories/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    });
    return successResponse(data);
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return errorResponse(message, status);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    const { id } = await params;
    await categoriesApiRequest(`/categories/${id}`, { method: "DELETE", token });
    return successResponse({ message: "Category deleted successfully" }, 204);
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return errorResponse(message, status);
  }
}