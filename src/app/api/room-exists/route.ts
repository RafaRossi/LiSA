import { RoomServiceClient } from "livekit-server-sdk";
import {NextRequest, NextResponse } from "next/server";

const roomService = new RoomServiceClient(
    process.env.NEXT_PUBLIC_LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
)

export async function GET(request: NextRequest){
    const room = request.nextUrl.searchParams.get("room");

    if(!room){
        return NextResponse.json({status: 404});
    }

    const rooms = await roomService.listRooms([room]);

    return NextResponse.json({ exists: rooms.length > 0 });
}