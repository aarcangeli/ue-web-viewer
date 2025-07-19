#include "ExportLayoutCommandlet.h"

#include "Serialization/Formatters/JsonArchiveOutputFormatter.h"
#include "UAssetBrowseExporter/CustomJsonWriter.h"
#include "UAssetBrowseExporter/UAssetBrowseExporter.h"
#include "UObject/PropertyOptional.h"

namespace {
TSharedPtr<FJsonValue> ConvertToJsonUsingArchive(auto Value) {
    TArray<uint8> JsonData;

    {
        FMemoryWriter Ar(JsonData, /*bIsPersistent*/ true);
        FJsonArchiveOutputFormatter Formatter(Ar);
        FStructuredArchive StructuredAr(Formatter);
        FStructuredArchiveRecord Record = StructuredAr.Open().EnterRecord();
        Record.EnterField(TEXT("Value")) << Value;
        StructuredAr.Close();
    }
    JsonData.Add(0);

    FString JsonString(UTF8_TO_TCHAR(JsonData.GetData()));

    // Parse back to JsonObject
    TSharedPtr<FJsonValue> JsonObject;
    if (!FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(JsonString), JsonObject) || !JsonObject || !JsonObject->AsObject()) {
        checkf(false, TEXT("Failed to parse JSON: %s"), *JsonString);
        return MakeShared<FJsonValueString>(TEXT("__INVALID_JSON__"));
    }
    return JsonObject->AsObject()->TryGetField(TEXT("Value"));
}
} // namespace

int32 UExportLayoutCommandlet::Main(const FString &Params) {
    UE_LOG(UAssetBrowseExporterLog, Display, TEXT("**** Starting ExportLayoutCommandlet ****"));

    if (Params.IsEmpty()) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("No output file specified"));
        return 1;
    }

    // Relative path of the real CWD instead of the binary directory
    const FString AbsoluteOutputDirectory{FPaths::ConvertRelativePathToFull(FGenericPlatformMisc::LaunchDir(), OutputDirectory)};
    if (!FPaths::DirectoryExists(AbsoluteOutputDirectory)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Output directory does not exist: %s"), *AbsoluteOutputDirectory);
        return 1;
    }
    UE_LOG(UAssetBrowseExporterLog, Display, TEXT("Exporting layout to %s"), *AbsoluteOutputDirectory);

    // Save layout to JSON
    const auto LayoutInfo = ExportLayout();
    FString LayoutJsonString;
    if (!CustomStructToString(LayoutInfo, LayoutJsonString)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Failed to convert layout info to JSON"));
        return 1;
    }

    // Write LayoutDump.json
    const FString LayoutFilePath = AbsoluteOutputDirectory / TEXT("LayoutDump.json");
    if (!FFileHelper::SaveStringToFile(LayoutJsonString, *LayoutFilePath)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Failed to export layout to %s"), *LayoutFilePath);
        return 1;
    }

    // Export default objects
    const auto DefaultObjects = GetDefaultObjects();
    FString DefaultObjectsJsonString;
    if (!CustomStructToString(DefaultObjects, DefaultObjectsJsonString)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Failed to convert layout info to JSON"));
        return 1;
    }

    // Write DefaultObjects.json
    const FString DefaultObjectsFilePath = AbsoluteOutputDirectory / TEXT("DefaultObjects.json");
    if (!FFileHelper::SaveStringToFile(DefaultObjectsJsonString, *DefaultObjectsFilePath)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Failed to export default objects to %s"), *DefaultObjectsFilePath);
        return 1;
    }

    UE_LOG(UAssetBrowseExporterLog, Display, TEXT("Layout exported to %s"), *LayoutFilePath);
    return 0;
}

TSharedRef<FJsonObject> UExportLayoutCommandlet::ExportLayout() {
    const auto LayoutInfo = MakeShared<FJsonObject>();

    TArray<TSharedPtr<FJsonValue>> Packages;
    const auto ListPackages = GetListPackages();
    for (const auto Package : ListPackages) {
        UE_LOG(UAssetBrowseExporterLog, Display, TEXT("Exporting package: %s"), *Package->GetName());
        Packages.Add(ExportPackage(Package));
    }
    LayoutInfo->SetArrayField("packages", Packages);

    return LayoutInfo;
}

TArray<UObject *> UExportLayoutCommandlet::GetSortedChildren(const UObject *Object) {
    TArray<UObject *> Result;
    ForEachObjectWithOuter(Object, [&](UObject *It) { Result.Add(It); });
    Result.Sort([](const UObject &A, const UObject &B) { return A.GetName() < B.GetName(); });
    return Result;
}

TSharedRef<FJsonValue> UExportLayoutCommandlet::ExportPackage(const UPackage *Package) {
    const auto Result = MakeShared<FJsonObject>();
    Result->SetStringField("packageName", Package->GetName());

    // Iterate classes and structs
    const TArray<UObject *> ObjectsInPackage = GetSortedChildren(Package);
    TArray<TSharedPtr<FJsonValue>> Classes;
    TArray<TSharedPtr<FJsonValue>> Structs;
    for (UObject *Object : ObjectsInPackage) {
        if (const auto Class = Cast<UClass>(Object); IsValid(Class) && !Class->HasAnyFlags(RF_ClassDefaultObject)) {
            Classes.Add(ExportClass(Class));
        } else if (const auto Struct = Cast<UScriptStruct>(Object); IsValid(Struct) && !Struct->HasAnyFlags(RF_ClassDefaultObject)) {
            Structs.Add(ExportStruct(Struct));
        }
    }
    Result->SetArrayField("classes", MoveTemp(Classes));
    Result->SetArrayField("structs", MoveTemp(Classes));

    return MakeShared<FJsonValueObject>(Result);
}

TSharedRef<FJsonValue> UExportLayoutCommandlet::ExportStruct(const UScriptStruct *Struct) {
    const auto Result = MakeShared<FJsonObject>();
    Result->SetStringField("structName", Struct->GetName());
    Result->SetField("properties", ExportProperties(Struct));
    return MakeShared<FJsonValueObject>(Result);
}

TSharedRef<FJsonValue> UExportLayoutCommandlet::ExportClass(const UClass *Class) {
    const auto Result = MakeShared<FJsonObject>();
    Result->SetStringField("className", Class->GetName());
    Result->SetField("superClass", MakeClassRef(Class->GetSuperClass()));
    Result->SetField("properties", ExportProperties(Class));
    return MakeShared<FJsonValueObject>(Result);
}

TSharedRef<FJsonValue> UExportLayoutCommandlet::ExportProperties(const UStruct *Struct) {
    TArray<TSharedPtr<FJsonValue>> Properties;
    for (TFieldIterator<const FProperty> PropIt(Struct, EFieldIterationFlags::IncludeDeprecated); PropIt; ++PropIt) {
        Properties.Add(ExportProperty(*PropIt));
    }
    return MakeShared<FJsonValueArray>(Properties);
}

TSharedPtr<FJsonValue> UExportLayoutCommandlet::SerializeObject(UObject *Object) {
    TSharedPtr<FJsonObject> result = MakeShareable(new FJsonObject());
    result->SetStringField("className", Object->GetClass()->GetPathName());
    result->SetStringField("objectName", Object->GetPathName());

    // Export property values
    const auto Properties = MakeShared<FJsonObject>();
    for (TFieldIterator<const FProperty> PropIt(Object->GetClass(), EFieldIterationFlags::IncludeAll); PropIt; ++PropIt) {
        const FProperty *Property = *PropIt;
        if (Property->ArrayDim != 1) {
            TArray<TSharedPtr<FJsonValue>> ArrayValues;
            for (int32 i = 0; i < Property->ArrayDim; ++i) {
                ArrayValues.Add(GetPropertyValue(Object, Property, i));
            }
            Properties->SetArrayField(Property->GetName(), ArrayValues);
        } else {
            Properties->SetField(Property->GetName(), GetPropertyValue(Object, Property, 0));
        }
    }
    result->SetField("properties", MakeShareable(new FJsonValueObject(Properties)));

    // Serialize inner objects
    TArray<TSharedPtr<FJsonValue>> InnerObjects;
    ForEachObjectWithOuter(Object, [&](UObject *innerObject) { InnerObjects.Add(SerializeObject(innerObject)); });
    result->SetArrayField("innerObjects", InnerObjects);

    return MakeShared<FJsonValueObject>(result);
}

TSharedRef<FJsonValue> UExportLayoutCommandlet::ExportProperty(const FProperty *Property) {
    TSharedRef<FJsonObject> Result = MakeShared<FJsonObject>();

    // Export the name only for the root property
    if (Property->GetOwner<FProperty>() == nullptr) {
        Result->SetStringField("name", Property->GetName());
        const auto PropertyFlags = Property->GetPropertyFlags();
        Result->SetNumberField("flagsLower", static_cast<int32>(PropertyFlags));
        Result->SetNumberField("flagsUpper", static_cast<int32>(PropertyFlags >> 32));
    }

    Result->SetStringField("type", Property->GetID().ToString());

    if (Property->ArrayDim != 1) {
        Result->SetNumberField("arrayDim", Property->ArrayDim);
    }

    if (const auto objectProperty = CastField<FObjectProperty>(Property)) {
        Result->SetField("objectType", MakeClassRef(objectProperty->PropertyClass));
    } else if (const auto arrayProperty = CastField<FArrayProperty>(Property)) {
        Result->SetField("valueType", ExportProperty(arrayProperty->Inner));
    } else if (const auto mapProperty = CastField<FMapProperty>(Property)) {
        Result->SetField("keyType", ExportProperty(mapProperty->KeyProp));
        Result->SetField("valueType", ExportProperty(mapProperty->ValueProp));
    } else if (const auto setProperty = CastField<FSetProperty>(Property)) {
        Result->SetField("valueType", ExportProperty(setProperty->ElementProp));
    } else if (const auto structProperty = CastField<FStructProperty>(Property)) {
        Result->SetField("structType", MakeStructRef(structProperty->Struct));
    } else if (const auto enumProperty = CastField<FEnumProperty>(Property)) {
        Result->SetStringField("enumType", enumProperty->GetEnum()->GetName());
    } else if (const auto byteProperty = CastField<FByteProperty>(Property)) {
        if (byteProperty->Enum) {
            Result->SetStringField("enumType", byteProperty->Enum->GetName());
        }
    } else if (const auto optionalProperty = CastField<FOptionalProperty>(Property)) {
        Result->SetField("valueType", ExportProperty(optionalProperty->GetValueProperty()));
    }

    return MakeShared<FJsonValueObject>(Result);
}

TSharedPtr<FJsonValue> UExportLayoutCommandlet::MakeClassRef(const UClass *Class) {
    if (!Class) {
        return MakeShared<FJsonValueNull>();
    }

    const auto JsonObject = MakeShared<FJsonObject>();
    JsonObject->SetStringField("package", Class->GetOutermost()->GetName());
    JsonObject->SetStringField("class", Class->GetName());
    return MakeShared<FJsonValueObject>(JsonObject);
}

TSharedPtr<FJsonValue> UExportLayoutCommandlet::MakeStructRef(const UScriptStruct *Struct) {
    const auto JsonObject = MakeShared<FJsonObject>();
    JsonObject->SetStringField("package", Struct->GetOutermost()->GetName());
    JsonObject->SetStringField("struct", Struct->GetName());
    return MakeShared<FJsonValueObject>(JsonObject);
}

TSharedRef<FJsonObject> UExportLayoutCommandlet::GetDefaultObjects() {
    TArray<UObject *> DefaultObjects;
    for (const auto Package : GetListPackages()) {
        ForEachObjectWithOuter(Package, [&](UObject *It) {
            if (const auto Class = Cast<UClass>(It); IsValid(Class) && !Class->HasAnyFlags(RF_ClassDefaultObject)) {
                const auto CDO = Class->GetDefaultObject();
                check(IsValid(CDO));
                DefaultObjects.Add(CDO);
            }
        });
    }

    // Sort objects by name
    DefaultObjects.Sort([](const UObject &A, const UObject &B) { return A.GetName() < B.GetName(); });

    auto Result = MakeShared<FJsonObject>();

    TArray<TSharedPtr<FJsonValue>> DefaultObjectsJson;
    for (UObject *DefaultObject : DefaultObjects) {
        DefaultObjectsJson.Add(SerializeObject(DefaultObject));
    }
    Result->SetArrayField("defaultObjects", DefaultObjectsJson);

    return Result;
}

TSharedPtr<FJsonValue> UExportLayoutCommandlet::GetPropertyValue(void *Object, const FProperty *Property, int32 ArrayIndex) const {
    // Note: check SerializeItem value for details of memory layout

    // Bool type
    if (auto CastedProperty = CastField<FBoolProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueBoolean(Value));
    }

    // Integer values
    if (auto CastedProperty = CastField<FInt8Property>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueNumber(static_cast<double>(Value)));
    }
    if (auto CastedProperty = CastField<FInt16Property>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueNumber(static_cast<double>(Value)));
    }
    if (auto CastedProperty = CastField<FIntProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueNumber(static_cast<double>(Value)));
    }
    if (auto CastedProperty = CastField<FUInt16Property>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueNumber(static_cast<double>(Value)));
    }
    if (auto CastedProperty = CastField<FUInt32Property>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueNumber(static_cast<double>(Value)));
    }

    // Special case for FInt64Property and FUInt64Property
    if (auto CastedProperty = CastField<FInt64Property>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueString(FString::Printf(TEXT("%llu"), Value)));
    }
    if (auto CastedProperty = CastField<FUInt64Property>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueString(FString::Printf(TEXT("%llu"), Value)));
    }

    // floating point types
    if (auto CastedProperty = CastField<FFloatProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueNumber(static_cast<double>(Value)));
    }
    if (auto CastedProperty = CastField<FDoubleProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueNumber(Value));
    }

    // string types
    if (auto CastedProperty = CastField<FStrProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueString(Value));
    }
    if (auto CastedProperty = CastField<FNameProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueString(Value.ToString()));
    }
    if (auto CastedProperty = CastField<FTextProperty>(Property)) {
        // FText has a private API, so we need to use FJsonArchiveOutputFormatter to access internal data.
        auto Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return ConvertToJsonUsingArchive(Value);
    }
    if (auto CastedProperty = CastField<FUtf8StrProperty>(Property)) {
        const auto Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShared<FJsonValueString>(FString(Value));
    }

    // Enum
    if (auto EnumProperty = CastField<FEnumProperty>(Property)) {
        void *Value = EnumProperty->ContainerPtrToValuePtr<void>(Object);
        FName EnumValueName;
        if (const auto Enum = EnumProperty->GetEnum()) {
            const int64 IntValue = EnumProperty->GetUnderlyingProperty()->GetSignedIntPropertyValue(Value);

            // Write flags as "A | B | C"
            if (Enum->HasAnyEnumFlags(EEnumFlags::Flags)) {
                if (IntValue != 0) {
                    EnumValueName = *Enum->GetValueOrBitfieldAsString(IntValue);
                }
            } else {
                EnumValueName = Enum->GetNameByValue(IntValue);
            }
        }
        return MakeShareable(new FJsonValueString(EnumValueName.ToString()));
    }
    if (auto CastedProperty = CastField<FByteProperty>(Property)) {
        const auto Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);

        // Byte Property can be optionally an enum
        if (const auto Enum = CastedProperty->Enum) {
            FName EnumValueName = Enum->GetNameByValue(Value);
            return MakeShareable(new FJsonValueString(EnumValueName.ToString()));
        }

        // Or it is just a byte
        return MakeShareable(new FJsonValueNumber(static_cast<double>(Value)));
    }

    // Object references
    if (auto CastedProperty = CastField<FObjectProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        if (IsValid(Value)) {
            return MakeShareable(new FJsonValueString(Value->GetPathName()));
        }
        return MakeShared<FJsonValueNull>();
    }
    if (auto WeakObjectPtr = CastField<FWeakObjectProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object);
        UObject *OldObjectValue = WeakObjectPtr->GetObjectPropertyValue(Value);
        if (IsValid(OldObjectValue)) {
            return MakeShareable(new FJsonValueString(OldObjectValue->GetPathName()));
        }
        return MakeShared<FJsonValueNull>();
    }
    if (auto CastedProperty = CastField<FWeakObjectProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        if (const UObject *ReferencedObject = Value.Get(); IsValid(ReferencedObject)) {
            return MakeShareable(new FJsonValueString(ReferencedObject->GetPathName()));
        }
        return MakeShared<FJsonValueNull>();
    }
    if (auto CastedProperty = CastField<FInterfaceProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        if (const UObject *ReferencedObject = Value.GetObject(); IsValid(ReferencedObject)) {
            return MakeShareable(new FJsonValueString(ReferencedObject->GetPathName()));
        }
        return MakeShared<FJsonValueNull>();
    }
    if (auto CastedProperty = CastField<FLazyObjectProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        const auto JsonObject = MakeShared<FJsonObject>();
        JsonObject->SetStringField("guid", Value.GetUniqueID().GetGuid().ToString());
        if (const UObject *ReferencedObject = Value.Get(); IsValid(ReferencedObject)) {
            JsonObject->SetStringField("reference", ReferencedObject->GetPathName());
        } else {
            JsonObject->SetField("reference", MakeShared<FJsonValueNull>());
        }
        return MakeShared<FJsonValueObject>(JsonObject);
    }

    // Field path
    if (auto CastedProperty = CastField<FFieldPathProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShareable(new FJsonValueString(Value.ToString()));
    }

    // Delegates
    if (auto CastedProperty = CastField<FDelegateProperty>(Property)) {
        const auto &Value = CastedProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        if (Value.IsBound()) {
            const auto JsonObject = MakeShared<FJsonObject>();
            if (IsValid(Value.GetUObject())) {
                JsonObject->SetStringField("object", Value.GetUObject()->GetPathName());
            } else {
                JsonObject->SetField("object", MakeShared<FJsonValueNull>());
            }
            JsonObject->SetStringField("function", Value.GetFunctionName().ToString());
            return MakeShared<FJsonValueObject>(JsonObject);
        }
        return MakeShared<FJsonValueNull>();
    }
    if (auto CastedProperty = CastField<FMulticastSparseDelegateProperty>(Property)) {
        if (const FMulticastScriptDelegate *Value = CastedProperty->GetMulticastDelegate(CastedProperty->ContainerPtrToValuePtr<void>(Object, ArrayIndex))) {
            return ConvertToJsonUsingArchive(*Value);
        }
        return MakeShared<FJsonValueNull>();
    }
    if (auto CastedProperty = CastField<FMulticastInlineDelegateProperty>(Property)) {
        if (const FMulticastScriptDelegate *Value = CastedProperty->GetMulticastDelegate(CastedProperty->ContainerPtrToValuePtr<void>(Object, ArrayIndex));
            Value && Value->IsBound()) {
            // This method produces null objects, I don't know why.
            // Maybe, we need to use GetAllObjectsEvenIfUnreachable?
            // return ConvertToJsonUsingArchive(*Value);

            // TODO: find a way to convert it to JSON
            return MakeShared<FJsonValueString>(Value->ToString<UObject>());
        }
        return MakeShared<FJsonValueNull>();
    }

    // Soft object references
    if (auto SoftObjectProperty = CastField<FSoftObjectProperty>(Property)) {
        const auto Value = SoftObjectProperty->GetPropertyValue_InContainer(Object, ArrayIndex);
        return MakeShared<FJsonValueString>(Value.ToString());
    }

    // Struct
    if (auto StructProperty = CastField<FStructProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object, ArrayIndex);
        auto Properties = MakeShared<FJsonObject>();
        for (TFieldIterator<const FProperty> PropIt(StructProperty->Struct, EFieldIterationFlags::IncludeAll); PropIt; ++PropIt) {
            Properties->SetField(PropIt->GetName(), GetPropertyValue(Value, *PropIt));
        }
        return MakeShared<FJsonValueObject>(Properties);
    }

    // Array
    if (auto ArrayProperty = CastField<FArrayProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object, ArrayIndex);
        FScriptArrayHelper ArrayHelper(ArrayProperty, Value);
        TArray<TSharedPtr<FJsonValue>> Values;
        for (int i = 0; i < ArrayHelper.Num(); ++i) {
            const auto ValuePtr = ArrayHelper.GetRawPtr(i);
            Values.Add(GetPropertyValue(ValuePtr, ArrayProperty->Inner));
        }
        return MakeShared<FJsonValueArray>(Values);
    }

    // Map
    if (auto MapProperty = CastField<FMapProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object, ArrayIndex);
        FScriptMapHelper MapHelper(MapProperty, Value);
        TArray<TSharedPtr<FJsonValue>> Values;
        for (int i = 0; i < MapHelper.Num(); ++i) {
            const auto ValuePtr = MapHelper.GetPairPtr(i);
            auto Pair = MakeShared<FJsonObject>();
            Pair->SetField("key", GetPropertyValue(ValuePtr, MapProperty->KeyProp));
            Pair->SetField("value", GetPropertyValue(ValuePtr, MapProperty->ValueProp));
            Values.Add(MakeShared<FJsonValueObject>(Pair));
        }
        return MakeShared<FJsonValueArray>(Values);
    }

    // Set
    if (auto SetProperty = CastField<FSetProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object, ArrayIndex);
        FScriptSetHelper SetHelper(SetProperty, Value);
        TArray<TSharedPtr<FJsonValue>> Values;
        for (int i = 0; i < SetHelper.Num(); ++i) {
            const auto ValuePtr = SetHelper.GetElementPtr(i);
            auto Item = GetPropertyValue(ValuePtr, SetProperty->ElementProp);
            Values.Add(Item);
        }
        return MakeShared<FJsonValueArray>(Values);
    }

    // Optional types
    if (auto OptionalProperty = CastField<FOptionalProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object, ArrayIndex);
        if (OptionalProperty->IsSet(Value)) {
            return GetPropertyValue(Value, OptionalProperty->GetValueProperty());
        }
        return MakeShared<FJsonValueNull>();
    }

    UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Invalid type: %s"), *Property->GetClass()->GetName());
    return MakeShared<FJsonValueString>("__INVALID__: Invalid type: " + Property->GetID().ToString());
}

TArray<UPackage *> UExportLayoutCommandlet::GetListPackages() {
    TArray<UPackage *> Packages;

    for (TObjectIterator<UPackage> PackageIt; PackageIt; ++PackageIt) {
        if (FPackageName::IsScriptPackage(PackageIt->GetName())) {
            UE_LOG(UAssetBrowseExporterLog, Display, TEXT("Exporting package: %s"), *PackageIt->GetName());
            Packages.Add(*PackageIt);
        }
    }

    return Packages;
}
