import { RegisterClass } from "../../../types/class-registry";
import { UObject } from "./Object";

/**
 * Represents a package.
 * At the moment, there are no extra fields to store here, as the {@link Asset}
 * class already contains all the package information.
 */
@RegisterClass("/Script/CoreUObject.Package")
export class UPackage extends UObject {
  private readonly __type_UPackage!: UPackage;
}
