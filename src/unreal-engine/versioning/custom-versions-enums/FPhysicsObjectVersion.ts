// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FPhysicsObjectVersion {
  // region Introduced with UE 4.12.0
  /// Before any version changes were made
  BeforeCustomVersionWasAdded = 0,
  // endregion

  // region Introduced with UE 4.24.0
  /// Adding PerShapeData to serialization
  PerShapeData = 1,
  /// Add serialization from handle back to particle
  SerializeGTGeometryParticles = 2,
  // endregion

  // region Introduced with UE 4.25.0
  /// Groom serialization with hair description as bulk data
  GroomWithDescription = 3,
  /// Groom serialization with import option
  GroomWithImportSettings = 4,
  // endregion

  // region Introduced with UE 4.27.0
  /// TriangleMesh has map from source vertex index to internal vertex index for per-poly collisoin.
  TriangleMeshHasVertexIndexMap = 5,
  /// Chaos Convex StructureData supports different index sizes based on num verts/planes
  VariableConvexStructureData = 6,
  /// Add the ability to enable or disable Continuous Collision Detection
  AddCCDEnableFlag = 7,
  /// Added the weighted value property type to store the cloths weight maps' low/high ranges
  ChaosClothAddWeightedValue = 8,
  /// Chaos FConvex uses array of FVec3s for vertices instead of particles
  ConvexUsesVerticesArray = 9,
  /// Add centrifugal forces for cloth
  ChaosClothAddfictitiousforces = 10,
  /// Added the Long Range Attachment stiffness weight map
  ChaosClothAddTetherStiffnessWeightMap = 11,
  /// Fix corrupted LOD transition maps
  ChaosClothFixLODTransitionMaps = 12,
  /// Convex structure data is now an index-based half-edge structure
  ChaosConvexUsesHalfEdges = 13,
  /// Convex structure data has a list of unique edges (half of the half edges)
  ChaosConvexHasUniqueEdgeSet = 14,
  // endregion

  // region Introduced with UE 5.0.0
  /// Chaos FGeometryCollectionObject user defined collision shapes support
  GeometryCollectionUserDefinedCollisionShapes = 15,
  /// Chaos Remove scale from TKinematicTarget object
  ChaosKinematicTargetRemoveScale = 16,
  /// Chaos Added support for per-object collision constraint flag.
  AddCollisionConstraintFlag = 17,
  /// Expose particle Disabled flag to the game thread
  AddDisabledFlag = 18,
  /// Added max linear and angular speed to Chaos bodies
  AddChaosMaxLinearAngularSpeed = 19,
  /// add convex geometry to older collections that did not have any
  GeometryCollectionConvexDefaults = 20,
  // endregion
}

export const FPhysicsObjectVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "BeforeCustomVersionWasAdded",
    comment: "Before any version changes were made",
    value: 0,
    firstAppearance: "4.12.0",
  }),
  new VersionDetails({
    name: "PerShapeData",
    comment: "Adding PerShapeData to serialization",
    value: 1,
    firstAppearance: "4.24.0",
  }),
  new VersionDetails({
    name: "SerializeGTGeometryParticles",
    comment: "Add serialization from handle back to particle",
    value: 2,
    firstAppearance: "4.24.0",
  }),
  new VersionDetails({
    name: "GroomWithDescription",
    comment: "Groom serialization with hair description as bulk data",
    value: 3,
    firstAppearance: "4.25.0",
  }),
  new VersionDetails({
    name: "GroomWithImportSettings",
    comment: "Groom serialization with import option",
    value: 4,
    firstAppearance: "4.25.0",
  }),
  new VersionDetails({
    name: "TriangleMeshHasVertexIndexMap",
    comment:
      "TriangleMesh has map from source vertex index to internal vertex index for per-poly collisoin.",
    value: 5,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "VariableConvexStructureData",
    comment:
      "Chaos Convex StructureData supports different index sizes based on num verts/planes",
    value: 6,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "AddCCDEnableFlag",
    comment:
      "Add the ability to enable or disable Continuous Collision Detection",
    value: 7,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "ChaosClothAddWeightedValue",
    comment:
      "Added the weighted value property type to store the cloths weight maps' low/high ranges",
    value: 8,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "ConvexUsesVerticesArray",
    comment:
      "Chaos FConvex uses array of FVec3s for vertices instead of particles",
    value: 9,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "ChaosClothAddfictitiousforces",
    comment: "Add centrifugal forces for cloth",
    value: 10,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "ChaosClothAddTetherStiffnessWeightMap",
    comment: "Added the Long Range Attachment stiffness weight map",
    value: 11,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "ChaosClothFixLODTransitionMaps",
    comment: "Fix corrupted LOD transition maps",
    value: 12,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "ChaosConvexUsesHalfEdges",
    comment: "Convex structure data is now an index-based half-edge structure",
    value: 13,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "ChaosConvexHasUniqueEdgeSet",
    comment:
      "Convex structure data has a list of unique edges (half of the half edges)",
    value: 14,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "GeometryCollectionUserDefinedCollisionShapes",
    comment:
      "Chaos FGeometryCollectionObject user defined collision shapes support",
    value: 15,
    firstAppearance: "5.0.0",
  }),
  new VersionDetails({
    name: "ChaosKinematicTargetRemoveScale",
    comment: "Chaos Remove scale from TKinematicTarget object",
    value: 16,
    firstAppearance: "5.0.0",
  }),
  new VersionDetails({
    name: "AddCollisionConstraintFlag",
    comment: "Chaos Added support for per-object collision constraint flag.",
    value: 17,
    firstAppearance: "5.0.0",
  }),
  new VersionDetails({
    name: "AddDisabledFlag",
    comment: "Expose particle Disabled flag to the game thread",
    value: 18,
    firstAppearance: "5.0.0",
  }),
  new VersionDetails({
    name: "AddChaosMaxLinearAngularSpeed",
    comment: "Added max linear and angular speed to Chaos bodies",
    value: 19,
    firstAppearance: "5.0.0",
  }),
  new VersionDetails({
    name: "GeometryCollectionConvexDefaults",
    comment: "add convex geometry to older collections that did not have any",
    value: 20,
    firstAppearance: "5.0.0",
  }),
];
