import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://inventory-backend-hm7r.onrender.com";

/**
 * GET /api/proxy/inventory_summary/[inventoryId]/transactions/[transactionType]
 * Get transaction summary by type for an inventory item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inventoryId: string; transactionType: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { inventoryId, transactionType } = await params;

    if (!inventoryId) {
      return NextResponse.json(
        { message: "Inventory ID is required" },
        { status: 400 }
      );
    }

    if (!transactionType || !["purchase", "sale"].includes(transactionType)) {
      return NextResponse.json(
        { message: "Valid transaction type is required (purchase or sale)" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/inventory_summary/${inventoryId}/transactions/${transactionType}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch transaction summary" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}