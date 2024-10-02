/**
 * Before UE 5.4 there was a simplified tag format which doesn't contain the hierarchy of property types.
 * For example, for guids, it only contains "Guid" instead of "/Script/CoreUObject.Guid".
 * This table describe a list of known types and their hierarchy.
 */

import { FName, FNameMap } from "../structs/Name";
import structs from "./struct-table.json";

const structTyped = structs as {
  [key: string]: string[];
};

function makeRow(packageName: string, structName: string): [FName, FName] {
  return [FName.fromString(structName), FName.fromString(packageName)];
}

let values = Object.keys(structTyped).flatMap((packageName) => {
  // const value = structs[key] as string[];
  // return value.map(([packageName, structName]) => makeRow(packageName, structName));
  return structTyped[packageName].map((structName) => makeRow(packageName, structName));
});

export const typeTable = new FNameMap<FName>(values);
