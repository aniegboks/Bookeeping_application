import { NextResponse, type NextRequest } from "next/server";
import { fetchSubCategoryById, updateSubCategory, deleteSubCategory, SubCategory } from "@/lib/sub_categories";

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;

  try {
    const data: SubCategory = await fetchSubCategoryById(token!, params.id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;
  const body: Partial<SubCategory> = await req.json();

  try {
    const updated = await updateSubCategory(token!, params.id, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;

  try {
    await deleteSubCategory(token!, params.id);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
