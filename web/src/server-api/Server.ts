import { Preset, PresetFilters } from "../model/Preset";
import { Entity, Transient, Updates } from "../lib/entity/Entity";

export type ListParams<Filters> = {
  limit?: number;
  offset?: number;
  fields?: string[];
  filters?: Filters;
};

export type ListResults<T> = {
  total: number;
  offset: number;
  items: T[];
};

export interface ReadOnlyEndpoint<E extends Entity, Filters> {
  get(id: E["id"]): Promise<E>;
  list(params?: ListParams<Filters>): Promise<ListResults<E>>;
}

export interface Endpoint<E extends Entity, Filters>
  extends ReadOnlyEndpoint<E, Filters> {
  create(entity: Transient<E>): Promise<E>;
  update(entity: Updates<E>): Promise<E>;
  delete(entity: E | E["id"]): Promise<void>;
}

export interface Server {
  readonly presets: Endpoint<Preset, PresetFilters>;
}
