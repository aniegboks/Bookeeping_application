import { NextResponse, type NextRequest } from "next/server";
import { fetchAllSubCategories, createSubCategory, SubCategory } from "@/lib/sub_categories";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  try {
    const data: SubCategory[] = await fetchAllSubCategories(token);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const body: Partial<SubCategory> = await req.json();

  try {
    const created = await createSubCategory(token!, body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
