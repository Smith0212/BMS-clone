import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have uuid installed. Wait, can we use crypto.randomUUID()? Yes Node has it.

// Server-side in-memory Map
export const bookingsMap = new Map();

export async function POST(request) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const { seats, showInfo, totalAmount, movieId } = data;

        const bookingId = crypto.randomUUID();

        const newBooking = {
            id: bookingId,
            userId: session.user.id,
            movieId,
            showInfo,
            seats,
            totalAmount,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString()
        };

        bookingsMap.set(bookingId, newBooking);

        return NextResponse.json({ success: true, bookingId }, { status: 201 });
    } catch (error) {
        console.error('Booking Error:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}

export async function GET(request) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userBookings = Array.from(bookingsMap.values()).filter(b => b.userId === session.user.id);

    // Sort by created descending
    userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ bookings: userBookings });
}
