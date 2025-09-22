// CORRECTED MIDDLEWARE (middleware.ts)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const book_keeping_test_url = process.env.BOOK_KEEPING_TEST_URL;

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const verify = await fetch(`${book_keeping_test_url}`, {
            method: "GET", // ✅ ADD: Explicitly specify GET method
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json", // ✅ ADD: Content-Type header
            },
        });

        if (!verify.ok) {
            // ✅ IMPROVE: Clear invalid token before redirecting
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("token");
            return response;
        }
    } catch (err) {
        console.error("Authentication error:", err);
        // ✅ IMPROVE: Clear token on network errors too
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
    }

    return NextResponse.next();
}

// ✅ IMPROVE: Better matcher to avoid redirect loops
export const config = {
    matcher: [
        // Exclude: API routes, Next.js internals, static files, login page
        '/((?!api/|_next/static|_next/image|favicon.ico|images/|login$).*)'
    ],
};

