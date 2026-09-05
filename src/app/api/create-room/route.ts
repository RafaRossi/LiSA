import { RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse} from "next/server";

const roomService = new RoomServiceClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
);

export async function POST(request: NextRequest){
    const body = await request.json();
    const { roomCode, title, description } = body;

    if(!roomCode){
        return NextResponse.json({ error: "Room not found"}, { status: 400 });
    }

    await roomService.createRoom({
        name: roomCode,
        emptyTimeout: 60,
        departureTimeout: 30,
        metadata: JSON.stringify({
            title: title?.trim() || 'Sala sem nome',
            description: description?.trim() || '',
        }),
    })

    return NextResponse.json({ success: true });
}