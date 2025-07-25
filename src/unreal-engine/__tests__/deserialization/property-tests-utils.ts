import type { TaggedProperty } from "../../properties/TaggedProperty";
import { UObject } from "../../modules/CoreUObject/objects/Object";

/**
 * Add matchers and serializer for properties testing
 */
export function extendJest() {
  expect.extend({
    toBeValidProperty(property: TaggedProperty) {
      if (property.value.type === "error") {
        const message = property.value.message;
        return {
          message: () => `${message}\nAt property: ${property.tag}`,
          pass: false,
        };
      }

      return {
        message: () => "OK",
        pass: true,
      };
    },
  });

  // UObject references should be serialized using their full name
  expect.addSnapshotSerializer({
    test: (val) => val instanceof UObject,
    serialize: (obj: UObject) => {
      return "[ref] " + obj.fullName;
    },
  });
}

/**
 * Matches all properties of the given object against their stored snapshots.
 * This guarantees consistent serialization, even for properties from older versions.
 *
 * @param object The object whose properties should be checked against snapshots.
 */
export function matchSnapshots(object: UObject) {
  for (const property of object.properties) {
    expect(property).toMatchSnapshot();
  }
}

/**
 * Validate that all properties are valid
 * @param object
 */
export function validateObject(object: UObject) {
  // Validate that all properties are valid
  object.properties.forEach(shouldNotContainErrorProperties);
}

function shouldNotContainErrorProperties(property: TaggedProperty) {
  expect(property).toBeValidProperty();

  if (property.value.type === "struct") {
    for (const field of property.value.value) {
      shouldNotContainErrorProperties(field);
    }
  }
}
