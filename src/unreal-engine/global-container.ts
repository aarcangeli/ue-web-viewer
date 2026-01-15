import type { Container } from "./container";

/**
 * Retrieves the global container used to load objects.
 * Avoid using this unless no other option is available.
 */
export let globalContainer: Container | undefined;

export function setGlobalContainer(container: Container | undefined) {
  globalContainer = container;
}
