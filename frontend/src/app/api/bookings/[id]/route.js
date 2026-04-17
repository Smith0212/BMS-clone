import { NextResponse } from 'next/server';
import { bookingsMap } from '../route';
import { auth } from '@/lib/auth';

export async function GET(request, { params }) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const booking = bookingsMap.get(id);

    if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ensure the booking belongs to the current user
    if (booking.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ booking }, { status: 200 });
}
