// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class UAssetBrowseExporter : ModuleRules {
    public UAssetBrowseExporter(ReadOnlyTargetRules Target)
        : base(Target) {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PrivateDependencyModuleNames.AddRange(new[] {
            "Core",
            "CoreUObject",
            "Engine",
            "Slate",
            "SlateCore",
            "Json",
            "JsonUtilities",
        });
    }
}
