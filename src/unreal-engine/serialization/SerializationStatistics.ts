import { ELoadingPhase } from "../modules/CoreUObject/objects/Object";
import type { AssetApi } from "./Asset";

export class SerializationStatistics {
  constructor(
    public readonly extraBytes: number | null,
    public readonly error: string | null,
  ) {}
}

/**
 * Used to manage the state of an object loaded from an asset.
 */
export class ObjectSource {
  readonly assetApi: AssetApi | null = null;
  serializationStatistics: SerializationStatistics | null = null;

  /**
   * The loading phase of the object.
   */
  loadingPhase: ELoadingPhase = ELoadingPhase.None;

  constructor(
    loadingPhase: ELoadingPhase,
    serializationStatistics: SerializationStatistics,
    assetApi: AssetApi | null,
  ) {
    this.loadingPhase = loadingPhase;
    this.serializationStatistics = serializationStatistics;
    this.assetApi = assetApi;
  }
}
