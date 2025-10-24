import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TEST_URL = process.env.BOOK_KEEPING_TEST_URL!;
const REFRESH_URL = process.env.BOOK_KEEPING_REFRESH_URL!;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const verify = await fetch(TEST_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (verify.ok) {
      return NextResponse.next();
    }

    if (refreshToken) {
      const refreshResponse = await fetch(REFRESH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const response = NextResponse.next();

        response.cookies.set("token", data.access_token, {
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });

        // Optional: set new refresh token if backend rotates it
        if (data.refresh_token) {
          response.cookies.set("refresh_token", data.refresh_token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });
        }

        return response;
      }
    }

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("refresh_token");
    return response;
  } catch (err) {
    console.error("Authentication error:", err);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("refresh_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|images/|login$).*)",
  ],
};
