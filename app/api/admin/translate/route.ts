import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  // Ensure the user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user || ((session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    // Google Translate Free API endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Translation API failed");
    }

    const data = await response.json();
    
    // The response is an array of arrays where data[0] contains the translation segments
    // e.g. [[["مرحبا", "hello", null, null, 1]], null, "en"]
    const translatedText = data[0].map((item: any) => item[0]).join("");

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 });
  }
}
