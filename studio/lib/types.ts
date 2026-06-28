export type CallingCardLayerRole = "background" | "texture" | "emblem" | "foreground";
export type RightsStatus = "unknown" | "owned" | "licensed" | "public_domain";
export type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "soft-light";

export interface CardField {
  dataType: string;
  value: unknown;
  source: "user" | "template" | "import" | "system" | "game_engine" | "ai_proposed";
  visible?: boolean;
  locked?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CardLayer {
  id: string;
  kind: "text" | "image" | "background" | "border";
  fieldKey?: string;
  assetId?: string;
  box: { x: number; y: number; width: number; height: number; rotation?: number };
  visible?: boolean;
  locked?: boolean;
  accessibleRole?: "content" | "label" | "image" | "presentation";
  style?: Record<string, unknown>;
}

export interface CardDocument {
  schemaVersion: "0.1.0";
  card: {
    id: string;
    kind: "calling_card";
    title: string;
    slug: string;
    status: "draft";
    visibility: "private";
    accessibleName: string;
  };
  fields: Record<string, CardField>;
  surfaces: Array<{
    key: string;
    layoutMode: "fixed";
    dimensions: { width: number; height: number; unit: "px"; dpi: number };
    background: { color: string };
    layers: CardLayer[];
    accessibilityOrder: string[];
  }>;
  classifications: Array<{ scheme: string; path: string; role: "primary" | "visual_style" }>;
  assets: Array<{ assetId: string; role: string }>;
  permissions: Array<{ principal: string; actions: Array<"read" | "edit" | "remix"> }>;
  remixPolicy: { mode: "duplicate"; requireAttribution: boolean; allowCommercialUse: boolean };
  metadata: Record<string, unknown>;
}

export interface StudioProject {
  id: string;
  card: CardDocument;
  activeSurface: "card";
  assetIds: string[];
  createdAt: string;
  updatedAt: string;
  editorVersion: "0.1.0";
}

export interface AssetMetadata {
  id: string;
  workspaceId: "local";
  kind: "image";
  name: string;
  uri: string;
  mimeType: string;
  width: number;
  height: number;
  source: "uploaded" | "ai_generated" | "ai_edited";
  rights: { status: RightsStatus; usageNotes?: string };
  generation?: {
    provider: string;
    model: string;
    prompt: string;
    settings?: Record<string, unknown>;
    sourceAssetIds?: string[];
  };
  createdAt: string;
  createdBy: "local-owner";
}

export interface AssetRecord {
  id: string;
  blob: Blob;
  metadata: AssetMetadata;
  byteSize: number;
  altText: string;
  role?: CallingCardLayerRole;
  createdAt: string;
}

export interface GenerationRequest {
  role: CallingCardLayerRole;
  prompt: string;
  cardContext: { message: string; signature: string; templateId: string };
  variantOfAssetId?: string;
}

export interface EditRequest {
  role: CallingCardLayerRole;
  instruction: string;
  sourceAssetId: string;
  referenceAssetIds: string[];
  cardContext: GenerationRequest["cardContext"];
}

export interface GenerationCandidate {
  id: string;
  role: CallingCardLayerRole;
  encoded: string;
  mimeType: string;
  width: number;
  height: number;
  provenance: {
    provider: string;
    model: string;
    prompt: string;
    settings: Record<string, unknown>;
    sourceAssetIds: string[];
    generatedAt: string;
  };
}

export interface ImageGenerationProvider {
  generate(request: GenerationRequest): Promise<GenerationCandidate>;
  edit(request: EditRequest, images: Array<{ bytes: Uint8Array; mimeType: string }>): Promise<GenerationCandidate>;
}

export type EditorCommand =
  | { type: "set-field"; field: "message" | "signature"; value: string }
  | { type: "bind-asset"; role: CallingCardLayerRole; assetId: string }
  | { type: "remove-asset"; role: CallingCardLayerRole }
  | { type: "update-layer"; role: CallingCardLayerRole; patch: Record<string, unknown> }
  | { type: "move-layer"; role: CallingCardLayerRole; direction: "up" | "down" };
