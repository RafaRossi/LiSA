import { RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const roomService = new RoomServiceClient(
    process.env.LIVEKIT_API_URL!,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
);

export async function POST(request: NextRequest) {
    const { roomCode } = await request.json();

    if (!roomCode) {
        return NextResponse.json({ error: "roomCode obrigatório" }, { status: 400 });
    }

    await roomService.deleteRoom(roomCode);
    return NextResponse.json({ success: true });
}