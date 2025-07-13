#pragma once

#include "Commandlets/Commandlet.h"
#include "CoreMinimal.h"
#include "JsonObjectWrapper.h"
#include "ExportLayoutCommandlet.generated.h"

USTRUCT()
struct FStructInfo {
    GENERATED_BODY()

    UPROPERTY()
    FName StructName;

    UPROPERTY()
    TMap<FString, FJsonObjectWrapper> Properties;
};

USTRUCT()
struct FClassInfo {
    GENERATED_BODY()

    UPROPERTY()
    FName ClassName;

    UPROPERTY()
    TMap<FString, FJsonObjectWrapper> Properties;

    UPROPERTY()
    FJsonObjectWrapper DefaultObject;
};

USTRUCT()
struct FPackageInfo {
    GENERATED_BODY()

    UPROPERTY()
    FName PackageName;

    UPROPERTY()
    TArray<FClassInfo> Classes;

    UPROPERTY()
    TArray<FStructInfo> Structs;
};

USTRUCT()
struct FLayoutInfo {
    GENERATED_BODY()

    UPROPERTY()
    TArray<FPackageInfo> Packages;
};

/**
 * Export the layout of native properties.
 */
UCLASS()
class UExportLayoutCommandlet : public UCommandlet {
    GENERATED_BODY()

    UPROPERTY()
    FString OutputDirectory;

    int32 Main(const FString &Params) override;

    FPackageInfo ExportPackage(const UPackage *package);
    FStructInfo ExportStruct(UStruct *Struct);
    FClassInfo ExportClass(UClass *Class);
    FJsonObjectWrapper ExportProperty(const FProperty *Property);
    TSharedRef<FJsonObject> ExportPropertyInner(const FProperty *Property);

    TSharedPtr<FJsonObject> MakeClassRef(const UClass *Class);
    TSharedPtr<FJsonObject> MakeStructRef(const UScriptStruct *Struct);

    TSharedPtr<FJsonObject> SerializeObject(UObject *Object);

    TSharedPtr<FJsonValue> GetPropertyValue(void *DefaultObject, const FProperty *Property) const;
};
