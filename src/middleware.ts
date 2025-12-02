import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    // Note: Firebase Auth runs on client-side, so we can't fully verify auth in middleware without session cookies.
    // However, we can check for a marker or just rely on client-side redirection for now, 
    // OR we can let the AuthProvider handle the redirection if user is null.
    // A common pattern with simple Firebase Auth is to let the client handle the redirect.
    // But to prevent flash of content, we might want to check for a cookie if we were using session cookies.

    // For this implementation, since we are using client-side auth, 
    // we will rely on the AuthProvider to handle the protection.
    // The middleware here is just a placeholder or for future server-side checks.

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
    ],
}
