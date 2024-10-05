import React from "react";
import { navigate } from "../utils/useHistoryState";
import { removePrefix } from "../utils/string-utils";
import type { FName } from "../unreal-engine/structs/Name";

const ProjectApiContext = React.createContext<ProjectApi | null>(null);

export const ProjectApiProvider = ProjectApiContext.Provider;

export class ProjectApi {
  constructor(public rootName: string) {}

  /**
   * Open the asset in the editor
   * @param assetReference
   */
  openAsset(assetReference: FName) {
    // TODO: check if the asset exists
    // TODO: verify case sensitivity
    if (assetReference.startsWith("/Game/")) {
      const path = `${this.rootName}/Content/${removePrefix(assetReference.text, "/Game/")}.uasset`;
      navigate(path);
    }
  }
}

export function useProjectApi() {
  const projectApi = React.useContext(ProjectApiContext);
  if (!projectApi) {
    throw new Error("ProjectApi must be used inside ProjectApiProvider");
  }
  return projectApi;
}
