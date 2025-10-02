// src/app/api/categories/[id]/route.ts
import { NextRequest } from "next/server";
import {
  categoriesApiRequest,
  getTokenFromRequest,
  successResponse,
  errorResponse,
} from "@/lib/categories";

// Custom error type
interface CustomError extends Error {
  status?: number;
}

function getErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    const customError = error as CustomError;
    return { message: customError.message, status: customError.status ?? 500 };
  }
  return { message: String(error), status: 500 };
}

interface Params {
  params: Promise<{ id: string }>;
}

// GET
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

// PUT
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

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    const { id } = await params;

    // Delete the category
    await categoriesApiRequest(`/categories/${id}`, { method: "DELETE", token });

    // Return 200 with JSON (do NOT use 204 with body)
    return successResponse({ message: "Category deleted successfully" });
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return errorResponse(message, status);
  }
}
