export type Json = null | Primitive | JsonObject | JsonArray;

export type Primitive = string | number | boolean;

export type JsonObject = { [key: string]: Json };

export type JsonArray = Json[];
