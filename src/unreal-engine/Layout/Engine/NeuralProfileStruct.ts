// This file is auto-generated, do not edit directly.

import type { ENeuralModelTileType } from "./ENeuralModelTileType";
import type { ENeuralProfileFormat } from "./ENeuralProfileFormat";
import type { ENeuralProfileRuntimeType } from "./ENeuralProfileRuntimeType";
import type { ETileOverlapResolveType } from "./ETileOverlapResolveType";
import type { FIntPoint } from "../CoreUObject/IntPoint";
import type { FIntVector4 } from "../CoreUObject/IntVector4";
import type { UObject } from "../CoreUObject/Object";

export interface FNeuralProfileStruct {
  InputFormat: ENeuralProfileFormat;
  OutputFormat: ENeuralProfileFormat;
  RuntimeType: ENeuralProfileRuntimeType;
  NNEModelData: UObject;
  InputDimension: FIntVector4;
  OutputDimension: FIntVector4;
  BatchSizeOverride: number;
  TileSize: ENeuralModelTileType;
  TileOverlap: FIntPoint;
  TileOverlapResolveType: ETileOverlapResolveType;
}
