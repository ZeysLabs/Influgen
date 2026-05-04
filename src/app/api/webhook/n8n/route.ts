import { NextRequest, NextResponse } from "next/server";
import { setResponse } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptId, imageUrl, status, error } = body;

    if (!promptId) {
      return NextResponse.json(
        { success: false, error: "promptId is required." },
        { status: 400 }
      );
    }

    const secret = req.headers.get("X-Webhook-Secret");
    if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    setResponse({
      promptId,
      imageUrl,
      status: status || (imageUrl ? "completed" : "failed"),
      error,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 500 }
    );
  }
}
