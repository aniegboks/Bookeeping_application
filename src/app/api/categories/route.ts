import { NextRequest } from "next/server";
import { categoriesApiRequest, getTokenFromRequest, successResponse, errorResponse } from "@/lib/categories";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    const data = await categoriesApiRequest("/categories", { token });
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, err.status || 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    const body = await req.json();
    const data = await categoriesApiRequest("/categories", { method: "POST", token, body: JSON.stringify(body) });
    return successResponse(data, 201);
  } catch (err: any) {
    return errorResponse(err.message, err.status || 500);
  }
}
