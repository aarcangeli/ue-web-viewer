#pragma once

#include "Commandlets/Commandlet.h"
#include "CoreMinimal.h"
#include "ExportLayoutCommandlet.generated.h"

/**
 * Export the layout of native properties.
 */
UCLASS()
class UExportLayoutCommandlet : public UCommandlet {
    GENERATED_BODY()

    UPROPERTY()
    FString OutputDirectory;

    int32 Main(const FString &Params) override;

    TSharedRef<FJsonObject> ExportLayout();
    TSharedRef<FJsonValue> ExportPackage(const UPackage *package);
    TSharedRef<FJsonValue> ExportStruct(const UScriptStruct *Struct);
    TSharedRef<FJsonValue> ExportEnum(const UEnum *Enum);
    TSharedRef<FJsonValue> ExportClass(const UClass *Class);
    TSharedRef<FJsonValue> ExportProperties(const UStruct *Struct);
    TSharedRef<FJsonValue> ExportProperty(const FProperty *Property);

    TSharedPtr<FJsonValue> MakeClassRef(const UClass *Class);
    TSharedPtr<FJsonValue> MakeStructRef(const UScriptStruct *Struct);
    TSharedPtr<FJsonValue> MakeEnumRef(const UEnum *Enum);

    TSharedRef<FJsonObject> GetDefaultObjects();

    TSharedPtr<FJsonValue> SerializeObject(UObject *Object);

    TSharedPtr<FJsonValue> GetPropertyValue(void *DefaultObject, const FProperty *Property, int32 ArrayIndex = 0) const;

    TArray<UPackage *> GetListPackages();
    TArray<UObject *> GetSortedChildren(const UObject *Object);
};
