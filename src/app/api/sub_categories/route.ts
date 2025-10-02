// src/app/api/sub_categories/route.ts

import { NextResponse, type NextRequest } from "next/server";
// Assuming you re-export your functions here to maintain your original structure
import {
  fetchAllSubCategories,
  createSubCategory,
  SubCategory,
} from "@/lib/sub_categories"; 

/**
 * Safely extracts error info from unknown values
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// GET /api/sub_categories
export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  try {
    const data: SubCategory[] = await fetchAllSubCategories(token);
    return NextResponse.json(data);
  } catch (err: unknown) {
    // If token is required for GET, this will return the error message from the API call
    console.error("Failed to fetch sub-categories:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

// POST /api/sub_categories
export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // 🛑 Security Check: Ensure token exists for creation
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: Partial<SubCategory> = await req.json();
    const created = await createSubCategory(token, body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("Failed to create sub-category:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}