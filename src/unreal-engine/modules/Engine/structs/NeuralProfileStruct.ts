import type { UObject } from "../../CoreUObject/objects/Object";
import { FIntPoint } from "../../CoreUObject/structs/IntPoint";
import { FIntVector4 } from "../../CoreUObject/structs/IntVector4";
import { ENeuralModelTileType } from "../enums/ENeuralModelTileType";
import { ENeuralProfileFormat } from "../enums/ENeuralProfileFormat";
import { ENeuralProfileRuntimeType } from "../enums/ENeuralProfileRuntimeType";
import { ETileOverlapResolveType } from "../enums/ETileOverlapResolveType";

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
