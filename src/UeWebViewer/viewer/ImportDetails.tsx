import { FAsset } from "../../unreal-engine/Asset";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import React from "react";

export function ImportDetails(props: { asset: FAsset }) {
  const imports = props.asset.imports;

  return (
    <SimpleDetailsView>
      <CollapsableSection name={`Imports (${imports.length})`}>
        {imports.map((value, index) => (
          <CollapsableSection name={`Import ${-index - 1}`} key={index}>
            <IndentedRow>Class Package2: {value.ClassPackage}</IndentedRow>
            <IndentedRow>Class Name: {value.ClassName}</IndentedRow>
            <IndentedRow>Outer Index: {value.OuterIndex}</IndentedRow>
            <IndentedRow>ObjectName: {value.ObjectName}</IndentedRow>
            <IndentedRow>PackageName: {value.PackageName}</IndentedRow>
            <IndentedRow>bImportOptional: {value.bImportOptional ? "true" : "false"}</IndentedRow>
          </CollapsableSection>
        ))}
      </CollapsableSection>
    </SimpleDetailsView>
  );
}
