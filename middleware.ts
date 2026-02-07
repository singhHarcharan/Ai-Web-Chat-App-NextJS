// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('auth-token')?.value;
//   const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
//                     request.nextUrl.pathname.startsWith('/register');
//   const isMainPage = request.nextUrl.pathname === '/';

//   // If user is not logged in and tries to access main page
//   if (isMainPage && !token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // If user is logged in and tries to access auth pages
//   if (isAuthPage && token) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };


import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/chat", "/api/workspaces", "/api/chats"],
};