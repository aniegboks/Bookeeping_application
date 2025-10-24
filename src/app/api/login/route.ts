// UPDATED LOGIN ROUTE (app/api/login/route.ts)
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const book_keeping_auth_url = process.env.BOOK_KEEPING_AUTH_URL;

  if (!book_keeping_auth_url) {
    return NextResponse.json(
      { error: "Auth URL not configured" },
      { status: 500 }
    );
  }

  try {
    const { email, password } = await req.json();

    // 🔹 Input validation
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // 🔹 Call backend login endpoint
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

      return NextResponse.json(
        {
          error: errorMessage,
          message: errorData?.message || errorMessage,
        },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    // 🔹 Validate response
    if (!data.access_token) {
      return NextResponse.json(
        { error: "Invalid response from authentication service" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      success: true,
      user: data.user || null,
      message: "Login successful",
    });

    // 🔹 Set access token cookie
    res.cookies.set("token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour or match backend access token lifetime
    });

    // 🆕 🔹 Also set refresh token cookie (for auto refresh)
    if (data.refresh_token) {
      res.cookies.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days (or match backend)
      });
    }

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Network error",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
