import type { FBox } from "../modules/CoreUObject/structs/Box";
import { FDateTime } from "../modules/CoreUObject/structs/DateTime";
import { FFrameNumber } from "../modules/CoreUObject/structs/FrameNumber";
import type { FGuid } from "../modules/CoreUObject/structs/Guid";
import type { FLinearColor } from "../modules/CoreUObject/structs/LinearColor";
import type { FMatrix44 } from "../modules/CoreUObject/structs/Matrix44";
import type { FRotator } from "../modules/CoreUObject/structs/Rotator";
import type { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { FTransform } from "../modules/CoreUObject/structs/Transform";
import { FTwoVectors } from "../modules/CoreUObject/structs/TwoVectors";
import type { FVector2 } from "../modules/CoreUObject/structs/Vector2";
import { FVector3 } from "../modules/CoreUObject/structs/Vector3";
import type { FVector4 } from "../modules/CoreUObject/structs/Vector4";

/**
 * All types that may be used as a native struct.
 */
export type NativeStructs =
  | FBox
  | FDateTime
  | FFrameNumber
  | FGuid
  | FLinearColor
  | FMatrix44
  | FRotator
  | FSoftObjectPath
  | FTransform
  | FTwoVectors
  | FVector2
  | FVector3
  | FVector4;
