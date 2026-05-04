import { NextRequest, NextResponse } from "next/server";
import { getResponse } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getResponse(id);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Prompt not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        promptId: data.promptId,
        status: data.status,
        imageUrl: data.imageUrl,
        error: data.error,
      },
    });
  } catch (error) {
    console.error("Get prompt error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
