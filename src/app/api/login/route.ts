// UPDATED LOGIN ROUTE (app/api/login/route.ts)
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const book_keeping_auth_url = process.env.BOOK_KEEPING_AUTH_URL;
  
  if (!book_keeping_auth_url) {
    return NextResponse.json({ error: "Auth URL not configured" }, { status: 500 });
  }

  try {
    const { email, password } = await req.json();
    
    // Input validation
    if (!email || !password) {
      return NextResponse.json({ 
        error: "Email and password are required",
        message: "Email and password are required" 
      }, { status: 400 });
    }

    // Call your backend login endpoint using environment variable
    const backendRes = await fetch(book_keeping_auth_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => null);
      
      let errorMessage = "Invalid credentials";
      if (backendRes.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (backendRes.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        message: errorData?.message || errorMessage
      }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    
    // Validate that we got a token
    if (!data.access_token) {
      return NextResponse.json({ 
        error: "Invalid response from authentication service" 
      }, { status: 500 });
    }

    // Create response with user data
    const res = NextResponse.json({ 
      success: true, 
      user: data.user,
      message: "Login successful"
    });
    
    // Set secure HTTP-only cookie
    res.cookies.set("token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ 
      error: "Network error",
      message: "Something went wrong. Please try again."
    }, { status: 500 });
  }
}