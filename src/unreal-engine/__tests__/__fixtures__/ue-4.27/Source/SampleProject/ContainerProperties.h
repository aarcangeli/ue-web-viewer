#pragma once

#include "CoreMinimal.h"
#include "SampleStruct.h"
#include "UObject/Object.h"
#include "ContainerProperties.generated.h"

/**
 * Base class for blueprint exposed properties used in test fixtures.
 *
 * Arrays, maps and sets properties.
 */
UCLASS(Blueprintable)
class SAMPLEPROJECT_API UContainerProperties : public UObject {
    GENERATED_BODY()

public:
    // Arrays
    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<uint8> ByteArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<TEnumAsByte<ESampleEnum>> EnumArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<int32> IntArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<FString> StringArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<FSampleStruct> StructArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<FText> TextArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<UObject *> ObjectArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<FName> NameArray;

    UPROPERTY(EditAnywhere, Category = "Array")
    TArray<FScriptInterface> InterfaceArray;

    // Set
    UPROPERTY(EditAnywhere, Category = "Set")
    TSet<int32> IntSet;

    UPROPERTY(EditAnywhere, Category = "Set")
    TSet<FString> StringSet;

    UPROPERTY(EditAnywhere, Category = "Set")
    TSet<FSampleStruct> StructSet;

    UPROPERTY(EditAnywhere, Category = "Set")
    TSet<UObject *> ObjectSet;

    UPROPERTY(EditAnywhere, Category = "Set")
    TSet<FName> NameSet;

    // Maps
    UPROPERTY(EditAnywhere, Category = "Map")
    TMap<int32, FString> IntToStringMap;

    UPROPERTY(EditAnywhere, Category = "Map")
    TMap<FString, FSampleStruct> StringToStructMap;

    UPROPERTY(EditAnywhere, Category = "Map")
    TMap<FGuid, UObject *> GuidToObjectMap;

    UPROPERTY(EditAnywhere, Category = "Map")
    TMap<UObject *, FName> ObjectToNameMap;

    UPROPERTY(EditAnywhere, Category = "Map")
    TMap<float, bool> FloatToBoolMap;
};
