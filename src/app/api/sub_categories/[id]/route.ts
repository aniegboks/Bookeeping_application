// src/app/api/sub_categories/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import {
  fetchSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  SubCategory,
} from "@/lib/sub_categories";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Shared error message extractor
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;

  try {
    const { id } = await params;
    const data: SubCategory = await fetchSubCategoryById(token!, id);
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;
  const body: Partial<SubCategory> = await req.json();

  try {
    const { id } = await params;
    const updated = await updateSubCategory(token!, id, body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;

  try {
    const { id } = await params;
    await deleteSubCategory(token!, id);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}