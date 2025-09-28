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
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!verify.ok) {
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("token");
            return response;
        }
    } catch (err) {
        console.error("Authentication error:", err);
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api/|_next/static|_next/image|favicon.ico|images/|login$).*)'
    ],
};
