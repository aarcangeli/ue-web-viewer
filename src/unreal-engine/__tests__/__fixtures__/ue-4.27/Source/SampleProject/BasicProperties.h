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
    UPROPERTY(EditAnywhere)
    bool Bool;

    // Integers
    UPROPERTY(EditAnywhere)
    int8 Int8;

    UPROPERTY(EditAnywhere)
    int16 Int16;

    UPROPERTY(EditAnywhere)
    int32 Int32;

    UPROPERTY(EditAnywhere)
    int64 Int64;

    UPROPERTY(EditAnywhere)
    uint8 UInt8;

    UPROPERTY(EditAnywhere)
    uint16 UInt16;

    UPROPERTY(EditAnywhere)
    uint32 UInt32;

    UPROPERTY(EditAnywhere)
    uint64 UInt64;

    // Floats
    UPROPERTY(EditAnywhere)
    float Float;

    UPROPERTY(EditAnywhere)
    double Double;

    // Strings
    UPROPERTY(EditAnywhere)
    FString String;

    UPROPERTY(EditAnywhere)
    FText Text;

    UPROPERTY(EditAnywhere)
    FName Name;

    // Enums
    UPROPERTY(EditAnywhere)
    TEnumAsByte<ESampleEnum> Enum;

    // struct
    UPROPERTY(EditAnywhere)
    FSampleStruct Struct;
};
