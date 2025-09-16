// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const book_keeping_auth_url = process.env.BOOK_KEEPING_AUTH_URL;

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const verify = await fetch(`${book_keeping_auth_url}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!verify.ok) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } catch (err) {
        console.error("Authentication error:", err);
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login).*)"], 
};