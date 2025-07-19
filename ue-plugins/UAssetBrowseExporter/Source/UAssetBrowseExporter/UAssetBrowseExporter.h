// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "Modules/ModuleManager.h"

DECLARE_LOG_CATEGORY_EXTERN(UAssetBrowseExporterLog, Log, All);

class FUAssetBrowseExporterModule : public IModuleInterface {
public:
    /** IModuleInterface implementation */
    void StartupModule() override;
    void ShutdownModule() override;
};
