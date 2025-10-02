// src/app/api/sub_categories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  fetchSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  SubCategory,
} from "@/lib/sub_categories";

/**
 * Type for the route handler context parameter
 * In Next.js 15, params is a Promise
 */
interface Context {
  params: Promise<{ id: string }>;
}

/**
 * Shared error message extractor
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// GET /api/sub_categories/[id]
export async function GET(req: NextRequest, { params }: Context) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const subCategory: SubCategory = await fetchSubCategoryById(token, id);
    return NextResponse.json(subCategory, { status: 200 });
  } catch (err: unknown) {
    console.error("Failed to fetch sub-category:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

// PUT /api/sub_categories/[id]
export async function PUT(req: NextRequest, { params }: Context) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body: Partial<SubCategory> = await req.json();
    const updated = await updateSubCategory(token, id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    console.error("Failed to update sub-category:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

// DELETE /api/sub_categories/[id]
export async function DELETE(req: NextRequest, { params }: Context) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteSubCategory(token, id);

    if (!deleted) {
      return NextResponse.json({ error: "Sub-category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Failed to delete sub-category:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}