// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 
  'https://inventory-backend-hm7r.onrender.com/api/v1';

interface CustomError extends Error {
  status?: number;
}

function getErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    const customError = error as CustomError;
    const status = customError.status ?? 500;
    return { message: customError.message, status };
  }
  return { message: String(error), status: 500 };
}

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 /api/categories GET - Starting");
    
    // Get token from cookies
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      console.error("❌ No token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.log("✅ Token found");
    console.log("📡 Fetching from backend:", `${BACKEND_BASE_URL}/categories`);
    
    // Call backend directly
    const response = await fetch(`${BACKEND_BASE_URL}/categories`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    
    console.log("📊 Backend response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error:", errorText);
      
      return NextResponse.json(
        { error: errorText || "Failed to fetch categories" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("✅ Data received:", Array.isArray(data) ? `${data.length} items` : typeof data);
    
    return NextResponse.json(data, { status: 200 });
    
  } catch (err: unknown) {
    console.error("❌ ERROR in /api/categories GET:", err);
    
    const { message, status } = getErrorMessage(err);
    console.error("📊 Error details:", { message, status });
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("📝 /api/categories POST - Starting");
    
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    console.log("📦 Body:", body);
    
    const response = await fetch(`${BACKEND_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    
    console.log("📊 Backend response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error:", errorText);
      
      return NextResponse.json(
        { error: errorText || "Failed to create category" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("✅ Category created");
    
    return NextResponse.json(data, { status: 201 });
    
  } catch (err: unknown) {
    console.error("❌ ERROR in /api/categories POST:", err);
    
    const { message, status } = getErrorMessage(err);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}