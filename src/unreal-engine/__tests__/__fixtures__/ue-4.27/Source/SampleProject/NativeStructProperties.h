// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "NativeStructProperties.generated.h"

/**
 * Base class for blueprint exposed properties used in test fixtures.
 *
 * Struct properties with custom serialize implementation.
 */
UCLASS(Blueprintable)
class SAMPLEPROJECT_API UNativeStructProperties : public UObject {
    GENERATED_BODY()

public:
    // Guid
    UPROPERTY(EditAnywhere)
    FGuid Guid;

    // IntPoint
    UPROPERTY(EditAnywhere)
    FIntPoint IntPoint;

    // IntVector
    UPROPERTY(EditAnywhere)
    FIntVector IntVector;

    // Vector2
    UPROPERTY(EditAnywhere)
    FVector2D Vector2D;

    // Vector3
    UPROPERTY(EditAnywhere)
    FVector Vector;

    // Vector4
    UPROPERTY(EditAnywhere)
    FVector4 Vector4;

    // TwoVectors
    UPROPERTY(EditAnywhere)
    FTwoVectors TwoVectors;

    // Matrix44
    UPROPERTY(EditAnywhere)
    FMatrix Matrix;

    // Plane4
    UPROPERTY(EditAnywhere)
    FPlane Plane;

    // Transform
    UPROPERTY(EditAnywhere)
    FTransform Transform;

    // Rotator
    UPROPERTY(EditAnywhere)
    FRotator Rotator;

    // Quat
    UPROPERTY(EditAnywhere)
    FQuat Quat;

    // Box
    UPROPERTY(EditAnywhere)
    FBox Box;

    // LinearColor
    UPROPERTY(EditAnywhere)
    FLinearColor LinearColor;

    // Color
    UPROPERTY(EditAnywhere)
    FColor Color;

    // DateTime
    UPROPERTY(EditAnywhere)
    FDateTime DateTime;

    // Timespan
    UPROPERTY(EditAnywhere)
    FTimespan Timespan;

    // FrameNumber
    UPROPERTY(EditAnywhere)
    FFrameNumber FrameNumber;

    // Object references
    UPROPERTY(EditAnywhere)
    FSoftObjectPath SoftObjectPath;

    UPROPERTY(EditAnywhere)
    FSoftClassPath SoftClassPath;

    UPROPERTY(EditAnywhere)
    TSubclassOf<UObject> SubclassOf;

    UPROPERTY(EditAnywhere)
    FScriptInterface ScriptInterface;

    // TFieldPath
    UPROPERTY(EditAnywhere)
    TFieldPath<FProperty> Name;
};
