import { RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";

const roomService = new RoomServiceClient(
    process.env.NEXT_PUBLIC_LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
);

export async function GET() {
    const rooms = await roomService.listRooms();
    return NextResponse.json(rooms);
}

export async function DELETE(request: Request) {
    const authHeader = request.headers.get('x-admin-key');
    if (authHeader !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomCode } = await request.json();
    await roomService.deleteRoom(roomCode);
    return NextResponse.json({ success: true });
}