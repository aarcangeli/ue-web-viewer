import type { FGuid } from "../modules/CoreUObject/structs/Guid";
import invariant from "tiny-invariant";

/**
 * Represents the guid of a custom version.
 * @param E The enum of the custom version.
 * @param T The type of the custom version (used for type checking).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class CustomVersionGuid<E = unknown> {
  readonly name: string;
  readonly guid: FGuid;
  readonly details: VersionDetails[];
  readonly latestVersion: number;

  constructor(args: { name: string; guid: FGuid; details: VersionDetails[] }) {
    invariant(args.details.length > 0, "Custom version details must not be empty.");
    this.name = args.name;
    this.guid = args.guid;
    this.details = args.details;
    this.latestVersion = this.details[this.details.length - 1].value;
  }

  get defaultValue(): E {
    // The default value is -1
    return -1 as unknown as E;
  }
}

/**
 * Represents a specific version with some metadata.
 * Example: PROPERTY_TAG_COMPLETE_TYPE_NAME=1012
 */
export class VersionDetails {
  /**
   * Name of the version (e.g. PROPERTY_TAG_COMPLETE_TYPE_NAME).
   */
  name: string;

  /**
   * Optional comment about the version.
   * This is parsed from the comment over the enum value.
   */
  comment?: string;

  /**
   * Value of the version (e.g. 1012).
   */
  value: number;

  /**
   * Represents the first release where this version was present.
   * This field is always defined.
   */
  firstAppearance: string;

  /**
   * Represents the last release where this version was present.
   * If undefined, it means that the version is still present.
   */
  lastAppearance?: string;

  constructor(args: {
    name: string;
    comment?: string;
    value: number;
    firstAppearance: string;
    lastAppearance?: string;
  }) {
    this.name = args.name;
    this.value = args.value;
    this.firstAppearance = args.firstAppearance;
    this.lastAppearance = args.lastAppearance;
  }
}
