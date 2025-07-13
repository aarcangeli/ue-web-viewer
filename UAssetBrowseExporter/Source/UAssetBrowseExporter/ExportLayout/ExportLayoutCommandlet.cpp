#include "ExportLayoutCommandlet.h"

#include "JsonObjectConverter.h"
#include "UAssetBrowseExporter/CustomJsonWriter.h"
#include "UAssetBrowseExporter/UAssetBrowseExporter.h"
#include "UObject/PropertyOptional.h"

int32 UExportLayoutCommandlet::Main(const FString &Params) {
    UE_LOG(UAssetBrowseExporterLog, Display, TEXT("**** Starting ExportLayoutCommandlet ****"));

    // Choose the directory relative to the working directory
    if (Params.IsEmpty()) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("No output directory specified"));
        return 1;
    }
    const FString AbsoluteOutputDirectory{FPaths::ConvertRelativePathToFull(FGenericPlatformMisc::LaunchDir(), OutputDirectory)};
    if (!FPaths::DirectoryExists(AbsoluteOutputDirectory)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Output directory does not exist: %s"), *AbsoluteOutputDirectory);
        return 1;
    }

    FLayoutInfo LayoutInfo;

    for (TObjectIterator<UPackage> PackageIt; PackageIt; ++PackageIt) {
        if (FPackageName::IsScriptPackage(PackageIt->GetName())) {
            UE_LOG(UAssetBrowseExporterLog, Display, TEXT("Exporting package: %s"), *PackageIt->GetName());
            LayoutInfo.Packages.Add(ExportPackage(*PackageIt));
        }
    }

    FString JsonString;
    if (!CustomStructToString(LayoutInfo, JsonString)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Failed to convert layout info to JSON"));
        return 1;
    }

    // Write LayoutDump.json
    const FString LayoutFilePath = AbsoluteOutputDirectory / TEXT("LayoutDump.json");
    if (!FFileHelper::SaveStringToFile(JsonString, *LayoutFilePath)) {
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Failed to export layout to %s"), *LayoutFilePath);
        return 1;
    }

    UE_LOG(UAssetBrowseExporterLog, Display, TEXT("Layout exported to %s"), *LayoutFilePath);
    return 0;
}

FPackageInfo UExportLayoutCommandlet::ExportPackage(const UPackage *Package) {
    FPackageInfo Result;
    Result.PackageName = Package->GetFName();

    // Iterate classes
    ForEachObjectWithOuter(Package, [&](UObject *Object) {
        if (const auto AsClass = Cast<UClass>(Object); IsValid(AsClass) && !AsClass->HasAnyFlags(RF_ClassDefaultObject)) {
            Result.Classes.Add(ExportClass(AsClass));
        } else if (const auto Struct = Cast<UStruct>(Object); IsValid(Struct) && !Struct->HasAnyFlags(RF_ClassDefaultObject)) {
            Result.Structs.Add(ExportStruct(Struct));
        }
    });

    return Result;
}

FStructInfo UExportLayoutCommandlet::ExportStruct(UStruct *Struct) {
    FStructInfo result;
    result.StructName = Struct->GetFName();

    for (TFieldIterator<const FProperty> PropIt(Struct, EFieldIterationFlags::IncludeDeprecated); PropIt; ++PropIt) {
        const FProperty *Property = *PropIt;
        result.Properties.Add(Property->GetName(), ExportProperty(Property));
    }

    return result;
}

FClassInfo UExportLayoutCommandlet::ExportClass(UClass *Class) {
    FClassInfo result;
    result.ClassName = Class->GetFName();

    for (TFieldIterator<const FProperty> PropIt(Class, EFieldIterationFlags::IncludeDeprecated); PropIt; ++PropIt) {
        const FProperty *Property = *PropIt;
        result.Properties.Add(Property->GetName(), ExportProperty(Property));
    }

    // result.DefaultObject.JsonObject = SerializeObject(Class->GetDefaultObject(true));

    return result;
}

TSharedPtr<FJsonObject> UExportLayoutCommandlet::SerializeObject(UObject *Object) {
    TSharedPtr<FJsonObject> result = MakeShareable(new FJsonObject());
    result->SetField("className", MakeShareable(new FJsonValueString(Object->GetClass()->GetPathName())));
    result->SetField("objectName", MakeShareable(new FJsonValueString(Object->GetPathName())));

    TSharedPtr<FJsonObject> Properties = MakeShareable(new FJsonObject());
    for (TFieldIterator<const FProperty> PropIt(Object->GetClass(), EFieldIterationFlags::IncludeAll); PropIt; ++PropIt) {
        const FProperty *Property = *PropIt;
        Properties->SetField(Property->GetName(), GetPropertyValue(Object, Property));
    }

    result->SetField("properties", MakeShareable(new FJsonValueObject(Properties)));

    // Serialize inner objects
    TArray<TSharedPtr<FJsonValue>> innerObjects;
    // Iterate classes
    ForEachObjectWithOuter(Object, [&](UObject *innerObject) {
        auto serialized = SerializeObject(innerObject);
        innerObjects.Add(MakeShared<FJsonValueObject>(std::move(serialized)));
    });
    result->SetField("innerObjects", MakeShareable(new FJsonValueArray(innerObjects)));

    return result;
}

FJsonObjectWrapper UExportLayoutCommandlet::ExportProperty(const FProperty *Property) {

    FJsonObjectWrapper Result;
    Result.JsonObject = ExportPropertyInner(Property);
    if (Property->ArrayDim != 1) {
        Result.JsonObject->SetNumberField("arrayDim", Property->ArrayDim);
    }
    return Result;
}

TSharedRef<FJsonObject> UExportLayoutCommandlet::ExportPropertyInner(const FProperty *Property) {
    TSharedRef<FJsonObject> Result = MakeShared<FJsonObject>();
    Result->SetStringField("type", Property->GetID().ToString());

    if (const auto objectProperty = CastField<FObjectProperty>(Property)) {
        Result->SetObjectField("objectType", MakeClassRef(objectProperty->PropertyClass));
    } else if (const auto arrayProperty = CastField<FArrayProperty>(Property)) {
        Result->SetObjectField("valueType", ExportPropertyInner(arrayProperty->Inner));
    } else if (const auto mapProperty = CastField<FMapProperty>(Property)) {
        Result->SetObjectField("keyType", ExportPropertyInner(mapProperty->KeyProp));
        Result->SetObjectField("valueType", ExportPropertyInner(mapProperty->ValueProp));
    } else if (const auto setProperty = CastField<FSetProperty>(Property)) {
        Result->SetObjectField("valueType", ExportPropertyInner(setProperty->ElementProp));
    } else if (const auto structProperty = CastField<FStructProperty>(Property)) {
        Result->SetObjectField("structType", MakeStructRef(structProperty->Struct));
    } else if (const auto enumProperty = CastField<FEnumProperty>(Property)) {
        Result->SetStringField("enumType", enumProperty->GetEnum()->GetName());
    } else if (const auto byteProperty = CastField<FByteProperty>(Property)) {
        if (byteProperty->Enum) {
            Result->SetStringField("enumType", byteProperty->Enum->GetName());
        }
    } else if (const auto optionalProperty = CastField<FOptionalProperty>(Property)) {
        Result->SetObjectField("valueType", ExportPropertyInner(optionalProperty->GetValueProperty()));
    }

    return Result;
}

TSharedPtr<FJsonObject> UExportLayoutCommandlet::MakeClassRef(const UClass *Class) {
    TSharedRef<FJsonObject> JsonObject = MakeShared<FJsonObject>();
    JsonObject->SetStringField("package", Class->GetOutermost()->GetName());
    JsonObject->SetStringField("class", Class->GetName());
    return JsonObject;
}

TSharedPtr<FJsonObject> UExportLayoutCommandlet::MakeStructRef(const UScriptStruct *Struct) {
    TSharedRef<FJsonObject> JsonObject = MakeShared<FJsonObject>();
    JsonObject->SetStringField("package", Struct->GetOutermost()->GetName());
    JsonObject->SetStringField("struct", Struct->GetName());
    return JsonObject;
}

template <class Prop, class ResultType>
TOptional<ResultType> GetValue(void *DefaultObject, const FProperty *Property) {
    if (Property->IsA<Prop>()) {
        return *Property->ContainerPtrToValuePtr<ResultType>(DefaultObject);
    }
    return NullOpt;
}

template <class Prop>
TOptional<TSharedPtr<FJsonValueNumber>> GetNumericValue(void *DefaultObject, const FProperty *Property) {
    if (Property->IsA<Prop>()) {
        typename Prop::TCppType *data = Property->ContainerPtrToValuePtr<typename Prop::TCppType>(DefaultObject);
        return TOptional<TSharedPtr<FJsonValueNumber>>(MakeShareable(new FJsonValueNumber(static_cast<double>(*data))));
    }
    return NullOpt;
}

TSharedPtr<FJsonValue> UExportLayoutCommandlet::GetPropertyValue(void *Object, const FProperty *Property) const {
    // Note: check SerializeItem value for details of memory layout

    if (Property->ArrayDim != 1) {
        // Not yet supported, probably uncommon case
        UE_LOG(UAssetBrowseExporterLog, Error, TEXT("ArrayDim > 1 for property %s in class %s"), *Property->GetName(), *Property->GetOwnerClass()->GetName());
        return MakeShared<FJsonValueString>("__INVALID__");
    }

    // Bool type
    if (auto Result = GetValue<FBoolProperty, bool>(Object, Property)) {
        return MakeShareable(new FJsonValueBoolean(*Result));
    }

    // Integer values
    if (auto Result = GetNumericValue<FInt8Property>(Object, Property)) {
        return *Result;
    }
    if (auto Result = GetNumericValue<FInt16Property>(Object, Property)) {
        return *Result;
    }
    if (auto Result = GetNumericValue<FIntProperty>(Object, Property)) {
        return *Result;
    }
    if (auto Result = GetNumericValue<FUInt16Property>(Object, Property)) {
        return *Result;
    }
    if (auto Result = GetNumericValue<FUInt32Property>(Object, Property)) {
        return *Result;
    }

    // Special case for FInt64Property and FUInt64Property
    if (auto Result = GetValue<FInt64Property, int64>(Object, Property)) {
        return MakeShareable(new FJsonValueString(FString::Printf(TEXT("%lld"), *Result)));
    }
    if (auto Result = GetValue<FUInt64Property, uint64>(Object, Property)) {
        return MakeShareable(new FJsonValueString(FString::Printf(TEXT("%lld"), *Result)));
    }

    // floating point types
    if (auto Result = GetValue<FFloatProperty, float>(Object, Property)) {
        return MakeShareable(new FJsonValueNumber(static_cast<double>(*Result)));
    }
    if (auto Result = GetValue<FDoubleProperty, double>(Object, Property)) {
        return MakeShareable(new FJsonValueNumber(*Result));
    }

    // string types
    if (auto Result = GetValue<FStrProperty, FString>(Object, Property)) {
        return MakeShareable(new FJsonValueString(*Result));
    }
    if (auto Result = GetValue<FNameProperty, FName>(Object, Property)) {
        return MakeShareable(new FJsonValueString(Result->ToString()));
    }

    // Enum
    if (auto EnumProperty = CastField<FEnumProperty>(Property)) {
        void *value = Property->ContainerPtrToValuePtr<void>(Object);
        FName EnumValueName;
        if (const auto Enum = EnumProperty->GetEnum()) {
            const int64 IntValue = EnumProperty->GetUnderlyingProperty()->GetSignedIntPropertyValue(value);

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
    if (auto ByteProperty = CastField<FByteProperty>(Property)) {
        uint8 *Value = Property->ContainerPtrToValuePtr<uint8>(Object);

        // Byte Property can be optionally an enum
        if (const auto Enum = ByteProperty->Enum) {
            FName EnumValueName = Enum->GetNameByValue(*Value);
            return MakeShareable(new FJsonValueString(EnumValueName.ToString()));
        }

        // Or it is just a byte
        return MakeShareable(new FJsonValueNumber(static_cast<double>(*Value)));
    }

    // Object types
    if (auto Result = GetValue<FObjectProperty, TObjectPtr<UObject>>(Object, Property)) {
        if (IsValid(*Result)) {
            return MakeShareable(new FJsonValueString((*Result)->GetPathName()));
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
    if (auto Result = GetValue<FWeakObjectProperty, TObjectPtr<UObject>>(Object, Property)) {
        if (IsValid(*Result)) {
            return MakeShareable(new FJsonValueString((*Result)->GetPathName()));
        }
        return MakeShared<FJsonValueNull>();
    }

    // Struct
    if (auto StructProperty = CastField<FStructProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object);
        auto Properties = MakeShared<FJsonObject>();
        for (TFieldIterator<const FProperty> PropIt(StructProperty->Struct, EFieldIterationFlags::IncludeAll); PropIt; ++PropIt) {
            Properties->SetField(PropIt->GetName(), GetPropertyValue(Value, *PropIt));
        }
        return MakeShared<FJsonValueObject>(Properties);
    }

    // Array
    if (auto ArrayProperty = CastField<FArrayProperty>(Property)) {
        void *Value = Property->ContainerPtrToValuePtr<void>(Object);
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
        void *Value = Property->ContainerPtrToValuePtr<void>(Object);
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
        void *Value = Property->ContainerPtrToValuePtr<void>(Object);
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
        void *Value = Property->ContainerPtrToValuePtr<void>(Object);
        if (OptionalProperty->IsSet(Value)) {
            return GetPropertyValue(Value, OptionalProperty->GetValueProperty());
        }
        return MakeShared<FJsonValueNull>();
    }

    UE_LOG(UAssetBrowseExporterLog, Error, TEXT("Invalid type: %s"), *Property->GetClass()->GetName());
    return MakeShared<FJsonValueString>("__INVALID__");
}
