import type { UTexture2D } from "../objects/Texture2D";

export class FMeshDisplacementMap {
  Texture: UTexture2D | null = null;
  Magnitude: number = 0;
  Center: number = 0;
}
