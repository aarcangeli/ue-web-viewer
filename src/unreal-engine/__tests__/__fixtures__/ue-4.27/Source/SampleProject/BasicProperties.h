// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "SampleStruct.h"
#include "UObject/Object.h"
#include "BasicProperties.generated.h"

/**
 * Base class for blueprint exposed properties used in test fixtures.
 *
 * Containers and custom serializer are stored in separate classes.
 */
UCLASS(Blueprintable)
class SAMPLEPROJECT_API UBasicProperties : public UObject {
    GENERATED_BODY()

    // Boolean
    UPROPERTY(EditAnywhere, Category = "Boolean")
    bool Bool;

    // Integers
    UPROPERTY(EditAnywhere, Category = "Integers")
    int8 Int8;

    UPROPERTY(EditAnywhere, Category = "Integers")
    int16 Int16;

    UPROPERTY(EditAnywhere, Category = "Integers")
    int32 Int32;

    UPROPERTY(EditAnywhere, Category = "Integers")
    int64 Int64;

    UPROPERTY(EditAnywhere, Category = "Integers")
    uint8 UInt8;

    UPROPERTY(EditAnywhere, Category = "Integers")
    uint16 UInt16;

    UPROPERTY(EditAnywhere, Category = "Integers")
    uint32 UInt32;

    UPROPERTY(EditAnywhere, Category = "Integers")
    uint64 UInt64;

    // Floats
    UPROPERTY(EditAnywhere, Category = "Floats")
    float Float;

    UPROPERTY(EditAnywhere, Category = "Floats")
    double Double;

    // Strings
    UPROPERTY(EditAnywhere, Category = "Strings")
    FString String;

    UPROPERTY(EditAnywhere, Category = "Strings")
    FText Text;

    UPROPERTY(EditAnywhere, Category = "Strings")
    FName Name;

    // Enums
    UPROPERTY(EditAnywhere, Category = "Enums")
    TEnumAsByte<ESampleEnum> Enum;

    // Object references
    UPROPERTY(EditAnywhere, Category = "Object references")
    FSoftObjectPath SoftObjectPath;

    UPROPERTY(EditAnywhere, Category = "Object references")
    FSoftClassPath SoftClassPath;

    UPROPERTY(EditAnywhere, Category = "Object references")
    TSubclassOf<UObject> SubclassOf;

    UPROPERTY(EditAnywhere, Category = "Object references")
    FScriptInterface ScriptInterface;

    // Tagged Struct
    UPROPERTY(EditAnywhere, Category = "Tagged Struct")
    FSampleStruct Struct;

    // Serialized Struct
    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FGuid Guid;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FIntPoint IntPoint;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FIntVector IntVector;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FVector2D Vector2D;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FVector Vector;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FVector4 Vector4;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FTwoVectors TwoVectors;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FMatrix Matrix;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FPlane Plane;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FTransform Transform;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FRotator Rotator;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FQuat Quat;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FBox Box;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FLinearColor LinearColor;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FColor Color;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FDateTime DateTime;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FTimespan Timespan;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FFrameNumber FrameNumber;

    UPROPERTY(EditAnywhere, Category = "Serialized Struct")
    FPerPlatformFloat PerPlatformFloat;
};
