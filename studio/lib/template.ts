import type { CardDocument, CallingCardLayerRole, StudioProject } from "./types";

export const TEMPLATE_ID = "calling-card-nocturne-v1";
export const CANVAS = { width: 750, height: 1050 } as const;
export const IMAGE_ROLES: CallingCardLayerRole[] = ["background", "texture", "foreground", "emblem"];

const imageLayer = (
  role: CallingCardLayerRole,
  box: { x: number; y: number; width: number; height: number },
  opacity = 1,
): CardDocument["surfaces"][number]["layers"][number] => ({
  id: `layer-${role}`,
  kind: "image",
  fieldKey: `${role}Asset`,
  box,
  visible: true,
  locked: false,
  accessibleRole: role === "texture" ? "presentation" : "image",
  style: { role, opacity, blendMode: role === "texture" ? "overlay" : "normal", cropX: 0.5, cropY: 0.5, scale: 1 },
});

export function createCallingCardProject(now = new Date().toISOString()): StudioProject {
  const id = crypto.randomUUID();
  return {
    id,
    activeSurface: "card",
    assetIds: [],
    createdAt: now,
    updatedAt: now,
    editorVersion: "0.1.0",
    card: {
      schemaVersion: "0.1.0",
      card: {
        id: `card-${id}`,
        kind: "calling_card",
        title: "Untitled calling card",
        slug: `calling-card-${id.slice(0, 8)}`,
        status: "draft",
        visibility: "private",
        accessibleName: "Calling card: Your message, signed Your name",
      },
      fields: {
        backgroundAsset: { dataType: "asset_ref", value: "", source: "template" },
        textureAsset: { dataType: "asset_ref", value: "", source: "template" },
        foregroundAsset: { dataType: "asset_ref", value: "", source: "template" },
        emblemAsset: { dataType: "asset_ref", value: "", source: "template" },
        message: { dataType: "string", value: "A small signal in the dark.", source: "user" },
        signature: { dataType: "string", value: "Your name", source: "user" },
      },
      surfaces: [{
        key: "card",
        layoutMode: "fixed",
        dimensions: { ...CANVAS, unit: "px", dpi: 144 },
        background: { color: "#12101d" },
        layers: [
          imageLayer("background", { x: 0, y: 0, ...CANVAS }),
          imageLayer("texture", { x: 0, y: 0, ...CANVAS }, 0.35),
          imageLayer("foreground", { x: 70, y: 355, width: 610, height: 520 }),
          imageLayer("emblem", { x: 275, y: 120, width: 200, height: 200 }),
          {
            id: "layer-message", kind: "text", fieldKey: "message",
            box: { x: 90, y: 710, width: 570, height: 140 },
            visible: true, accessibleRole: "content",
            style: { fontFamily: "Georgia", fontSize: 40, fill: "#f8efd8", align: "center", lineHeight: 1.18 },
          },
          {
            id: "layer-signature", kind: "text", fieldKey: "signature",
            box: { x: 150, y: 875, width: 450, height: 60 },
            visible: true, accessibleRole: "label",
            style: { fontFamily: "Arial", fontSize: 21, fill: "#d0b989", align: "center", letterSpacing: 3 },
          },
          {
            id: "layer-border", kind: "border",
            box: { x: 30, y: 30, width: 690, height: 990 },
            visible: true, locked: true, accessibleRole: "presentation",
            style: { stroke: "#c9a86a", strokeWidth: 3, insetStroke: "#75603c", inset: 12 },
          },
        ],
        accessibilityOrder: ["layer-emblem", "layer-message", "layer-signature", "layer-foreground"],
      }],
      classifications: [
        { scheme: "card-commons", path: "communication/calling-card", role: "primary" },
        { scheme: "card-commons-style", path: "nocturne", role: "visual_style" },
      ],
      assets: [],
      permissions: [{ principal: "owner", actions: ["read", "edit", "remix"] }],
      remixPolicy: { mode: "duplicate", requireAttribution: true, allowCommercialUse: false },
      metadata: { templateId: TEMPLATE_ID, editorVersion: "0.1.0" },
    },
  };
}

export function layerFor(project: StudioProject, role: CallingCardLayerRole) {
  return project.card.surfaces[0].layers.find((layer) => layer.style?.role === role);
}
