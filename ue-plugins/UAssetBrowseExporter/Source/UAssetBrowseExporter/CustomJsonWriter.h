#pragma once

#include "CoreMinimal.h"
#include "JsonObjectConverter.h"

/**
 * Converts a TSharedRef<FJsonObject> to a formatted JSON string.
 *
 * Note: The original method contains a bug where commas (",") are missing
 * between elements in JSON arrays of objects.
 */
inline bool CustomStructToString(const TSharedRef<FJsonObject> &JsonObject, FString &OutJsonString) {
    const FString EOL = TEXT("\n");
    const FString INDENT = TEXT("\t");

    FStringBuilderBase Builder;
    int32 IndentLevel = 0;
    const auto WriteIndent = [&]() {
        for (int32 i = 0; i < IndentLevel; ++i) {
            Builder.Append(INDENT);
        }
    };

    const auto WriteString = [&](FStringView String) -> bool {
        auto NeedsEscaping = [](TCHAR Char) -> bool {
            switch (Char) {
                case TCHAR('\\'):
                    return true;
                case TCHAR('\n'):
                    return true;
                case TCHAR('\t'):
                    return true;
                case TCHAR('\b'):
                    return true;
                case TCHAR('\f'):
                    return true;
                case TCHAR('\r'):
                    return true;
                case TCHAR('\"'):
                    return true;
                default:
                    // Must escape control characters
                    return Char < TCHAR(32);
            }
        };

        Builder.Append("\"");

        // Write successive runs of unescaped and escaped characters until the view is exhausted
        while (!String.IsEmpty()) {
            // In case we are handed a very large string, avoid checking all of it at once without writing anything
            constexpr int32 LongestRun = 2048;
            int32 EndIndex = 0;
            for (; EndIndex < String.Len() && EndIndex < LongestRun; ++EndIndex) {
                if (NeedsEscaping(String[EndIndex])) {
                    break;
                }
            }
            if (FStringView Blittable = String.Left(EndIndex); !Blittable.IsEmpty()) {
                Builder.Append(Blittable);
            }
            String.RightChopInline(EndIndex);

            for (EndIndex = 0; EndIndex < String.Len(); ++EndIndex) {
                TCHAR Char = String[EndIndex];
                switch (Char) {
                    case TCHAR('\\'):
                        Builder.Append(TEXT("\\\\"));
                        continue;
                    case TCHAR('\n'):
                        Builder.Append(TEXT("\\n"));
                        continue;
                    case TCHAR('\t'):
                        Builder.Append(TEXT("\\t"));
                        continue;
                    case TCHAR('\b'):
                        Builder.Append(TEXT("\\b"));
                        continue;
                    case TCHAR('\f'):
                        Builder.Append(TEXT("\\f"));
                        continue;
                    case TCHAR('\r'):
                        Builder.Append(TEXT("\\r"));
                        continue;
                    case TCHAR('\"'):
                        Builder.Append(TEXT("\\\""));
                        continue;
                    default:
                        break;
                }

                // Must escape control characters
                if (Char >= TCHAR(32)) {
                    break;
                } else {
                    Builder.Appendf(TEXT("\\u%04x"), Char);
                }
            }
            String.RightChopInline(EndIndex);
        }

        Builder.Append("\"");
        return true;
    };

    const TFunction<bool(const FJsonValue &Value)> WriteJsonValue = [&](const FJsonValue &Value) -> bool {
        switch (Value.Type) {
            case EJson::None:
                checkf(false, TEXT("Invalid JSON value type"));
                break;
            case EJson::Null:
                Builder.Append(TEXT("null"));
                break;
            case EJson::String:
                WriteString(Value.AsString());
                break;
            case EJson::Number:
                Builder.Appendf(TEXT("%.17g"), Value.AsNumber());
                break;
            case EJson::Boolean:
                Builder.Append(Value.AsBool() ? TEXT("true") : TEXT("false"));
                break;
            case EJson::Array: {
                const auto &AsArray = Value.AsArray();
                if (AsArray.Num() == 0) {
                    Builder.Append("[]");
                    break;
                }
                Builder.Append("[");
                IndentLevel++;
                bool IsFirst = true;
                for (const auto &Element : AsArray) {
                    if (!IsFirst) {
                        Builder.Append(",");
                    }
                    Builder.Append(EOL);
                    WriteIndent();
                    if (!WriteJsonValue(*Element)) {
                        return false;
                    }
                    IsFirst = false;
                }
                IndentLevel--;
                Builder.Append(EOL);
                WriteIndent();
                Builder.Append("]");
                break;
            }
            case EJson::Object: {
                TSharedPtr<FJsonObject> AsObject = Value.AsObject();
                if (AsObject->Values.IsEmpty()) {
                    Builder.Append("{}");
                    break;
                }
                Builder.Append("{");
                IndentLevel++;
                bool IsFirst = true;
                for (const auto &[ItKey, ItValue] : AsObject->Values) {
                    if (!IsFirst) {
                        Builder.Append(",");
                    }
                    Builder.Append(EOL);
                    WriteIndent();
                    WriteString(ItKey);
                    Builder.Append(": ");
                    if (!WriteJsonValue(*ItValue)) {
                        return false;
                    }
                    IsFirst = false;
                }
                IndentLevel--;
                Builder.Append(EOL);
                WriteIndent();
                Builder.Append("}");
                break;
            }
        }
        return true;
    };

    if (!WriteJsonValue(FJsonValueObject(JsonObject))) {
        return false;
    }

    OutJsonString = Builder.ToString();
    return true;
}
