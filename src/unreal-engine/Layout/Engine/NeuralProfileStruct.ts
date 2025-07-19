// This file is auto-generated, do not edit directly.

import { ENeuralModelTileType } from "./ENeuralModelTileType";
import { ENeuralProfileFormat } from "./ENeuralProfileFormat";
import { ENeuralProfileRuntimeType } from "./ENeuralProfileRuntimeType";
import { ETileOverlapResolveType } from "./ETileOverlapResolveType";
import { FIntPoint } from "../CoreUObject/IntPoint";
import { FIntVector4 } from "../CoreUObject/IntVector4";
import type { UObject } from "../CoreUObject/Object";

export class FNeuralProfileStruct {
  InputFormat: ENeuralProfileFormat = ENeuralProfileFormat.Type32;
  OutputFormat: ENeuralProfileFormat = ENeuralProfileFormat.Type32;
  RuntimeType: ENeuralProfileRuntimeType = ENeuralProfileRuntimeType.NNERuntimeORTDml;
  NNEModelData: UObject | null = null;
  InputDimension: FIntVector4 = new FIntVector4();
  OutputDimension: FIntVector4 = new FIntVector4();
  BatchSizeOverride: number = 0;
  TileSize: ENeuralModelTileType = ENeuralModelTileType.OneByOne;
  TileOverlap: FIntPoint = new FIntPoint();
  TileOverlapResolveType: ETileOverlapResolveType = ETileOverlapResolveType.Ignore;
}
