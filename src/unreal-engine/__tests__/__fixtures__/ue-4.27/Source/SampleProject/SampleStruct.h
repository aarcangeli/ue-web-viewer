#pragma once

#include "CoreMinimal.h"
#include "SampleStruct.generated.h"

UENUM()
enum ESampleEnum {
    None,
    First,
    Second,
};

USTRUCT(BlueprintType)
struct FSampleStruct {
    GENERATED_BODY()

    UPROPERTY(EditAnywhere)
    int32 IntValue;

    UPROPERTY(EditAnywhere)
    float FloatValue;

    UPROPERTY(EditAnywhere)
    FString StringValue;

    friend uint32 GetTypeHash(const FSampleStruct &SampleStruct) {
        return GetTypeHash(SampleStruct.IntValue) ^ GetTypeHash(SampleStruct.FloatValue) ^ GetTypeHash(SampleStruct.StringValue);
    }
};
