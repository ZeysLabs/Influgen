import { NextRequest, NextResponse } from "next/server";
import { createPending } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptId, category, selections, jsonPrompt, finalPrompt } = body;

    if (!promptId || !category || !finalPrompt) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: promptId, category, finalPrompt" },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { success: false, error: "N8N_WEBHOOK_URL is not configured." },
        { status: 500 }
      );
    }

    createPending(promptId);

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/webhook/n8n`;

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET && {
          "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET,
        }),
      },
      body: JSON.stringify({
        promptId,
        category,
        selections: selections || {},
        jsonPrompt: jsonPrompt || {},
        finalPrompt,
        callbackUrl,
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n webhook error:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to trigger n8n workflow.",
          details: {
            status: n8nResponse.status,
            statusText: n8nResponse.statusText,
            response: errorText.slice(0, 500),
            url: n8nWebhookUrl,
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Generation started. Check dashboard for results.",
      promptId,
    });
  } catch (error) {
    console.error("Generate image error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
