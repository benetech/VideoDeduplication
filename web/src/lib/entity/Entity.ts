import lodash from "lodash";

/**
 * Entity is an application-level object with identity.
 */
export type Entity = {
  id: number | string;
};

/**
 * All fields except `id` are optional.
 */
export type Updates<E extends Entity> = Entity & Partial<E>;

/**
 * Id is not present as Entity is not persisted yet.
 */
export type Transient<E extends Entity> = {
  [Field in keyof E as Exclude<Field, "id">]: E[Field];
};

/**
 * Type predicate for `Entity`, could be used for type narrowing.
 * @param value value which type will be verified.
 */
/* eslint-disable   @typescript-eslint/explicit-module-boundary-types */
export function isEntity(value: any): value is Entity {
  return isEntityId((value as Entity)?.id);
}

/**
 * Type predicate for entity id. Could be used for type narrowing.
 * @param value value which type will be verified.
 */
/* eslint-disable   @typescript-eslint/explicit-module-boundary-types */
export function isEntityId(value: any): value is Entity["id"] {
  return lodash.isFinite(value) || typeof value === "string";
}
