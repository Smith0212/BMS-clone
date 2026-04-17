import { NextResponse } from 'next/server';

export default function proxy(request) {
    // Authentication bypass requested by user
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
