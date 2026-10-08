import { NextResponse } from "next/server";
import { buildChatbotKnowledge, getSmartLocalResponse } from "@/lib/chatbot-knowledge";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // If no API key configured, use our rich local knowledge fallback directly
    if (!apiKey) {
      const fallbackText = getSmartLocalResponse(lastUserMessage);
      return createStreamResponse(fallbackText);
    }

    // Prepare system instruction and contents for Gemini
    const systemPrompt = await buildChatbotKnowledge();

    // Map conversation messages to Gemini format
    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }],
    }));

    // Candidate models to try in order of preference (lite / flash models)
    const candidateModels = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash-lite",
      "gemini-1.5-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest",
    ].filter(Boolean);

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

        const payload = {
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        };

        const geminiRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!geminiRes.ok) {
          const errData = await geminiRes.text();
          console.warn(`Gemini model ${model} failed (${geminiRes.status}):`, errData.slice(0, 200));
          lastError = errData;
          continue; // Try next model or fallback
        }

        // Successfully connected to Gemini stream!
        // Transform the Gemini SSE stream to clean text chunks
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const customStream = new ReadableStream({
          async start(controller) {
            const reader = geminiRes.body.getReader();
            let buffer = "";

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith("data: ")) {
                    const jsonStr = trimmed.slice(6);
                    try {
                      const parsed = JSON.parse(jsonStr);
                      const candidate = parsed.candidates?.[0];
                      const partText = candidate?.content?.parts?.[0]?.text;
                      if (partText) {
                        controller.enqueue(encoder.encode(partText));
                      }
                    } catch {
                      // ignore parse errors for partial chunks
                    }
                  }
                }
              }
            } catch (err) {
              console.error("Stream reading error:", err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(customStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
          },
        });
      } catch (err) {
        lastError = err.message;
      }
    }

    // If all Gemini models returned error (e.g. 403 project access denied or network error)
    console.warn("All Gemini models failed, falling back to smart local knowledge responder:", lastError);
    const fallbackAnswer = getSmartLocalResponse(lastUserMessage);
    return createStreamResponse(fallbackAnswer);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    );
  }
}

/** Helper to simulate smooth chunked streaming for fallback answers */
function createStreamResponse(text) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Split into small words/chunks to emulate natural streaming typing
      const words = text.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 15));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
