// src/app/api/sub_categories/route.ts
import { NextResponse, type NextRequest } from "next/server";
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

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  try {
    const data: SubCategory[] = await fetchAllSubCategories(token);
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const body: Partial<SubCategory> = await req.json();

  try {
    const created = await createSubCategory(token!, body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
