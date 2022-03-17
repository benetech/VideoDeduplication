import * as React from "react";

/**
 * Shorthand alias for type of input `onChange` handler.
 * Roughly equivalent to `(event: React.SyntheticEvent) => void`
 */
type OnChangeEventHandler = React.ChangeEventHandler<
  HTMLTextAreaElement | HTMLInputElement
>;

/**
 * Single field handler as available for user.
 */
export type FieldHandler = {
  onChange: OnChangeEventHandler;
  name: string;
  required: boolean;
};

/**
 * Form handler as available for client code.
 */
export type FormHandler<Fields> = {
  [Field in keyof Fields]: FieldHandler;
};

/**
 * Error-messages for some form fields.
 */
export type Errors<Fields> = {
  [Field in keyof Fields]?: string | null;
};
