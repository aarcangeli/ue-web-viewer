// This file is auto-generated, do not edit directly.

import type { ENeuralModelTileType } from "./ENeuralModelTileType";
import type { ENeuralProfileFormat } from "./ENeuralProfileFormat";
import type { ENeuralProfileRuntimeType } from "./ENeuralProfileRuntimeType";
import type { ETileOverlapResolveType } from "./ETileOverlapResolveType";
import type { FIntPoint } from "../CoreUObject/IntPoint";
import type { FIntVector4 } from "../CoreUObject/IntVector4";
import type { UObject } from "../CoreUObject/Object";

export class FNeuralProfileStruct {
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

  constructor(props: {
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
  }) {
    this.InputFormat = props.InputFormat;
    this.OutputFormat = props.OutputFormat;
    this.RuntimeType = props.RuntimeType;
    this.NNEModelData = props.NNEModelData;
    this.InputDimension = props.InputDimension;
    this.OutputDimension = props.OutputDimension;
    this.BatchSizeOverride = props.BatchSizeOverride;
    this.TileSize = props.TileSize;
    this.TileOverlap = props.TileOverlap;
    this.TileOverlapResolveType = props.TileOverlapResolveType;
  }
}
