import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image, documentName, pageNumber } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/png";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: `Analyse ce plan architectural/technique "${documentName || "Document"}" (page ${pageNumber || 1}).

Fournis une analyse détaillée en français incluant:

1. **Type de plan**: Identifie le type (plan d'étage, élévation, coupe, détail, schéma électrique/mécanique, etc.)

2. **Éléments principaux**: Liste les éléments architecturaux ou techniques visibles (murs, portes, fenêtres, équipements, conduits, etc.)

3. **Dimensions et échelle**: Note les dimensions principales si visibles

4. **Annotations**: Résume les notes et annotations importantes

5. **Observations**: Points d'attention, éléments remarquables ou potentiels problèmes

6. **Matériaux/Spécifications**: Si indiqués sur le plan

Sois précis et technique dans ton analyse.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      return NextResponse.json(
        { error: "Failed to analyze image" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysis = data.content?.[0]?.text || "Aucune analyse disponible";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
