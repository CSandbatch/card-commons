import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeImageRequest, validateImageBytes } from "@/lib/server/guards";
import { imageProvider } from "@/lib/server/provider";
import { setSessionCookie } from "@/lib/server/session";

const contextSchema = z.object({
  message: z.string().max(1000),
  signature: z.string().max(300),
  templateId: z.literal("calling-card-nocturne-v1"),
});
const roles = ["background", "texture", "emblem", "foreground"] as const;

export async function POST(request: NextRequest) {
  const auth = authorizeImageRequest(request);
  if (!auth.ok) return auth.error;
  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: "Invalid multipart request." }, { status: 400 }); }
  const role = form.get("role");
  const instruction = form.get("instruction");
  const sourceAssetId = form.get("sourceAssetId");
  const source = form.get("image");
  if (typeof role !== "string" || !roles.includes(role as typeof roles[number]) ||
      typeof instruction !== "string" || instruction.length < 3 || instruction.length > 4000 ||
      typeof sourceAssetId !== "string" || !(source instanceof File)) {
    return NextResponse.json({ error: "Edit request is invalid." }, { status: 400 });
  }
  let cardContext;
  try { cardContext = contextSchema.parse(JSON.parse(String(form.get("cardContext")))); }
  catch { return NextResponse.json({ error: "Card context is invalid." }, { status: 400 }); }
  const files = [source, ...form.getAll("references").filter((item): item is File => item instanceof File)].slice(0, 4);
  const referenceAssetIds = String(form.get("referenceAssetIds") ?? "").split(",").filter(Boolean).slice(0, 3);
  try {
    const images = await Promise.all(files.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      validateImageBytes(bytes, file.type);
      return { bytes, mimeType: file.type };
    }));
    const candidate = await imageProvider().edit({
      role: role as typeof roles[number], instruction, sourceAssetId, referenceAssetIds, cardContext,
    }, images);
    const response = NextResponse.json({ candidate }, { headers: { "Cache-Control": "no-store" } });
    setSessionCookie(response, { ...auth.session, remaining: auth.session.remaining - 1 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("must be") || message.includes("accepted") || message.includes("invalid")) {
      return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const moderation = status === 400 && String(error).toLowerCase().includes("safety");
    return NextResponse.json(
      { error: moderation ? "The provider declined that edit request." : "The image provider could not complete the edit." },
      { status: moderation ? 422 : status === 429 ? 429 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
