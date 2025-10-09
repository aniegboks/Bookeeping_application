// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 
  'https://inventory-backend-hm7r.onrender.com/api/v1';

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

// GET by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    const response = await fetch(`${BACKEND_BASE_URL}/categories/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch category" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}

// UPDATE
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await req.json();
    
    const response = await fetch(`${BACKEND_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to update category" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const { id } = await params;

    const response = await fetch(`${BACKEND_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to delete category" },
        { status: response.status }
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return NextResponse.json(
        { message: "Category deleted successfully" },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (err: unknown) {
    const { message, status } = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}