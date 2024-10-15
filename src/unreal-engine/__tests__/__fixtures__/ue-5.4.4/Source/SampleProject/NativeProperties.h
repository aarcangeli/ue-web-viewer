#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "NativeProperties.generated.h"

UCLASS()
class SAMPLEPROJECT_API ANativeProperties : public AActor {
    GENERATED_BODY()

public:
    ANativeProperties();

    // Diagnostic
    UPROPERTY(EditAnywhere)
    FString String;

    // Vector3
    UPROPERTY(EditAnywhere)
    FVector3f Vector3f;

    UPROPERTY(EditAnywhere)
    FVector3d Vector3d;

    UPROPERTY(EditAnywhere)
    FVector Vector;

    // IntPoint / UintPoint
    UPROPERTY(EditAnywhere)
    FInt32Point Int32Point;

    UPROPERTY(EditAnywhere)
    FInt64Point Int64Point;

    UPROPERTY(EditAnywhere)
    FUint32Point Uint32Point;

    UPROPERTY(EditAnywhere)
    FUint64Point Uint64Point;

    UPROPERTY(EditAnywhere)
    FIntPoint IntPoint;

    UPROPERTY(EditAnywhere)
    FUintPoint UintPoint;

    // IntVector2 / UintVector2
    UPROPERTY(EditAnywhere)
    FInt32Vector2 Int32Vector2;

    UPROPERTY(EditAnywhere)
    FInt64Vector2 Int64Vector2;

    UPROPERTY(EditAnywhere)
    FUint32Vector2 Uint32Vector2;

    UPROPERTY(EditAnywhere)
    FUint64Vector2 Uint64Vector2;

    UPROPERTY(EditAnywhere)
    FIntVector2 IntVector2;

    UPROPERTY(EditAnywhere)
    FUintVector2 UintVector2;

    // IntVector / UintVector
    UPROPERTY(EditAnywhere)
    FInt32Vector Int32Vector;

    UPROPERTY(EditAnywhere)
    FInt64Vector Int64Vector;

    UPROPERTY(EditAnywhere)
    FUint32Vector Uint32Vector;

    UPROPERTY(EditAnywhere)
    FUint64Vector Uint64Vector;

    UPROPERTY(EditAnywhere)
    FIntVector IntVector;

    UPROPERTY(EditAnywhere)
    FUintVector UintVector;

    // IntVector4 / UintVector4
    UPROPERTY(EditAnywhere)
    FInt32Vector4 Int32Vector4;

    UPROPERTY(EditAnywhere)
    FInt64Vector4 Int64Vector4;

    UPROPERTY(EditAnywhere)
    FUint32Vector4 Uint32Vector4;

    UPROPERTY(EditAnywhere)
    FUint64Vector4 Uint64Vector4;

    UPROPERTY(EditAnywhere)
    FIntVector4 IntVector4;

    UPROPERTY(EditAnywhere)
    FUintVector4 UintVector4;

    // Vector2
    UPROPERTY(EditAnywhere)
    FVector2f Vector2f;

    // UPROPERTY(EditAnywhere)
    // FVector2d Vector2d;

    UPROPERTY(EditAnywhere)
    FVector2D Vector2d;

    // Vector4
    UPROPERTY(EditAnywhere)
    FVector4f Vector4f;

    UPROPERTY(EditAnywhere)
    FVector4d Vector4d;

    UPROPERTY(EditAnywhere)
    FVector4 Vector4;

    // Plane4
    UPROPERTY(EditAnywhere)
    FPlane4f Plane4f;

    UPROPERTY(EditAnywhere)
    FPlane4d Plane4d;

    UPROPERTY(EditAnywhere)
    FPlane Plane;

    // Rotator
    UPROPERTY(EditAnywhere)
    FRotator3f Rotator3f;

    UPROPERTY(EditAnywhere)
    FRotator3d Rotator3d;

    UPROPERTY(EditAnywhere)
    FRotator Rotator;

    // Box
    UPROPERTY(EditAnywhere)
    FBox3f Box3f;

    UPROPERTY(EditAnywhere)
    FBox3d Box3d;

    UPROPERTY(EditAnywhere)
    FBox Box;

    // Matrix44
    UPROPERTY(EditAnywhere)
    FMatrix44f Matrix44f;

    UPROPERTY(EditAnywhere)
    FMatrix44d Matrix44d;

    UPROPERTY(EditAnywhere)
    FMatrix Matrix;

    // LinearColor
    UPROPERTY(EditAnywhere)
    FLinearColor LinearColor;

    // Color
    UPROPERTY(EditAnywhere)
    FColor Color;

    // Quat
    UPROPERTY(EditAnywhere)
    FQuat4f Quat4f;

    UPROPERTY(EditAnywhere)
    FQuat4d Quat4d;

    UPROPERTY(EditAnywhere)
    FQuat Quat;

    // TwoVectors
    UPROPERTY(EditAnywhere)
    FTwoVectors TwoVectors;

    // Guid
    UPROPERTY(EditAnywhere)
    FGuid Guid;

    // Transform
    UPROPERTY(EditAnywhere)
    FTransform3f Transform3f;

    UPROPERTY(EditAnywhere)
    FTransform3d Transform3d;

    UPROPERTY(EditAnywhere)
    FTransform Transform;

    // DateTime
    UPROPERTY(EditAnywhere)
    FDateTime DateTime;

    // Timespan
    UPROPERTY(EditAnywhere)
    FTimespan Timespan;

    // FrameNumber
    UPROPERTY(EditAnywhere)
    FFrameNumber FrameNumber;

    // SoftClassPath
    UPROPERTY(EditAnywhere)
    FSoftClassPath SoftClassPath;
};
