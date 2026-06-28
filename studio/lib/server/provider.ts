import OpenAI, { toFile } from "openai";
import type {
  CallingCardLayerRole, EditRequest, GenerationCandidate, GenerationRequest, ImageGenerationProvider,
} from "../types";
import { MAX_SERVER_OUTPUT_BYTES } from "./guards";

function settings(role: CallingCardLayerRole) {
  return role === "emblem"
    ? { size: "1024x1024" as const, output_format: "png" as const, background: "transparent" as const, width: 1024, height: 1024 }
    : { size: "1024x1536" as const, output_format: "webp" as const, background: "opaque" as const, width: 1024, height: 1536 };
}

function promptFor(request: GenerationRequest) {
  return [
    `Create the ${request.role} visual layer for a portrait calling card.`,
    request.prompt,
    `Card message: ${request.cardContext.message}`,
    `Signature: ${request.cardContext.signature}`,
    "Do not render letters, words, signatures, borders, frames, or mockup cards. Return only the visual layer.",
  ].join("\n");
}

async function retryOnce<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
    if (status !== 429 && status < 500) throw error;
    return operation();
  }
}

function outputCandidate(
  role: CallingCardLayerRole,
  b64: string | undefined,
  mimeType: string,
  width: number,
  height: number,
  provenance: GenerationCandidate["provenance"],
): GenerationCandidate {
  if (!b64) throw new Error("The image provider returned no image.");
  if (Buffer.byteLength(b64, "base64") > MAX_SERVER_OUTPUT_BYTES) throw new Error("The image provider output was too large.");
  return { id: `candidate-${crypto.randomUUID()}`, role, encoded: b64, mimeType, width, height, provenance };
}

export class OpenAIImageProvider implements ImageGenerationProvider {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

  async generate(request: GenerationRequest) {
    const target = settings(request.role);
    const prompt = promptFor(request);
    const result = await retryOnce(() => this.client.images.generate({
      model: this.model,
      prompt,
      size: target.size,
      output_format: target.output_format,
      background: target.background,
      quality: "medium",
      n: 1,
    }));
    return outputCandidate(request.role, result.data?.[0]?.b64_json,
      target.output_format === "png" ? "image/png" : "image/webp", target.width, target.height, {
        provider: "openai", model: this.model, prompt,
        settings: { size: target.size, outputFormat: target.output_format, background: target.background, quality: "medium" },
        sourceAssetIds: request.variantOfAssetId ? [request.variantOfAssetId] : [],
        generatedAt: new Date().toISOString(),
      });
  }

  async edit(request: EditRequest, images: Array<{ bytes: Uint8Array; mimeType: string }>) {
    const target = settings(request.role);
    const prompt = [
      `Edit the ${request.role} visual layer for a portrait calling card.`,
      request.instruction,
      `Card message: ${request.cardContext.message}`,
      "Preserve useful composition from the first image. Additional images are references only. Do not render text or a card border.",
    ].join("\n");
    const uploads = await Promise.all(images.map((image, index) =>
      toFile(image.bytes, `reference-${index}.${image.mimeType.split("/")[1]}`, { type: image.mimeType })));
    const result = await retryOnce(() => this.client.images.edit({
      model: this.model,
      image: uploads,
      prompt,
      size: target.size,
      output_format: target.output_format,
      background: target.background,
      quality: "medium",
      n: 1,
    }));
    return outputCandidate(request.role, result.data?.[0]?.b64_json,
      target.output_format === "png" ? "image/png" : "image/webp", target.width, target.height, {
        provider: "openai", model: this.model, prompt,
        settings: { size: target.size, outputFormat: target.output_format, background: target.background, quality: "medium" },
        sourceAssetIds: [request.sourceAssetId, ...request.referenceAssetIds],
        generatedAt: new Date().toISOString(),
      });
  }
}

class MockImageProvider implements ImageGenerationProvider {
  async generate(request: GenerationRequest) {
    this.maybeFail();
    return this.make(request.role, request.prompt, request.variantOfAssetId ? [request.variantOfAssetId] : []);
  }
  async edit(request: EditRequest) {
    this.maybeFail();
    return this.make(request.role, request.instruction, [request.sourceAssetId, ...request.referenceAssetIds]);
  }
  private maybeFail() {
    const mode = process.env.STUDIO_MOCK_FAILURE;
    if (mode === "moderation") throw Object.assign(new Error("safety moderation"), { status: 400 });
    if (mode === "rate") throw Object.assign(new Error("rate limit"), { status: 429 });
    if (mode === "provider") throw Object.assign(new Error("provider unavailable"), { status: 503 });
    if (mode === "oversized") throw new Error("The image provider output was too large.");
  }
  private make(role: CallingCardLayerRole, prompt: string, sourceAssetIds: string[]): GenerationCandidate {
    const palette: Record<CallingCardLayerRole, [string, string]> = {
      background: ["#161124", "#48375f"], texture: ["#725f86", "#d0b989"],
      emblem: ["#d6b56f", "#fff1c7"], foreground: ["#18372d", "#8eb497"],
    };
    const [a, b] = palette[role];
    const square = role === "emblem";
    const width = square ? 1024 : 1024;
    const height = square ? 1024 : 1536;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><radialGradient id="g"><stop stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${width / 2}" cy="${height / 2}" r="${width / 4}" fill="none" stroke="${b}" stroke-width="18" opacity=".8"/><path d="M${width*.25} ${height*.66} Q${width*.5} ${height*.2} ${width*.75} ${height*.66}" fill="none" stroke="${b}" stroke-width="11"/></svg>`;
    return {
      id: `candidate-${crypto.randomUUID()}`, role,
      encoded: Buffer.from(svg).toString("base64"), mimeType: "image/svg+xml", width, height,
      provenance: {
        provider: "mock", model: "deterministic-ci", prompt,
        settings: { size: `${width}x${height}` }, sourceAssetIds, generatedAt: new Date().toISOString(),
      },
    };
  }
}

export function imageProvider(): ImageGenerationProvider {
  if (process.env.STUDIO_MOCK_IMAGES === "true") return new MockImageProvider();
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAIImageProvider();
}
