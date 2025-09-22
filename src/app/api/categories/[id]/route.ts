import { NextRequest } from "next/server";
import { categoriesApiRequest, getTokenFromRequest, successResponse, errorResponse } from "@/lib/categories";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    const data = await categoriesApiRequest(`/categories/${params.id}`, { token });
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, err.status || 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    const body = await req.json();
    const data = await categoriesApiRequest(`/categories/${params.id}`, { method: "PUT", token, body: JSON.stringify(body) });
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, err.status || 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    await categoriesApiRequest(`/categories/${params.id}`, { method: "DELETE", token });
    return successResponse({ message: "Category deleted successfully" }, 204);
  } catch (err: any) {
    return errorResponse(err.message, err.status || 500);
  }
}
