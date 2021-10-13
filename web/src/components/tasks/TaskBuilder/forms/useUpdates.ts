import React, { useCallback } from "react";

/**
 * Text input change event (produced by html element having a string `value` attribute).
 */
type TextChangeEvent = React.ChangeEvent<
  HTMLTextAreaElement | HTMLInputElement
>;

/**
 * Convert new input value into target object updates.
 */
export type CalculateUpdatesFn<TValue, TTarget> = (
  value: TValue,
  current: TTarget
) => Partial<TTarget>;

/**
 * Convert new input value into value of a single attribute of the target object.
 */
export type CalculateFieldFn<TValue, TFieldType, TTarget> = (
  value: TValue,
  current: TTarget
) => TFieldType;

/**
 * Handler of text input change events.
 */
export type TextChangeHandler = (event: TextChangeEvent) => void;

/**
 * Handler of Autocomplete onChange events..
 */
export type AutocompleteHandler<TValue, Multiple extends boolean = true> = (
  // React.ChangeEvent<{}> is required
  /* eslint-disable   @typescript-eslint/ban-types */
  event: React.ChangeEvent<{}>,
  value: AutocompleteValue<TValue, Multiple>
) => void;

/**
 * Autocomplete value (either multiple value or a single one).
 */
export type AutocompleteValue<
  TValue,
  Multiple extends boolean = true
> = Multiple extends true ? TValue[] : TValue;

/**
 * Calculate target updates from autocompleted value.
 */
export type CalculateAutocompleteFn<
  TValue,
  TTarget,
  Multiple extends boolean = true
> = (
  value: AutocompleteValue<TValue, Multiple>,
  current: TTarget
) => Partial<TTarget>;

/**
 * Calculate single target attribute from autocompleted values.
 */
export type CalculateAutocompleteFieldFn<
  TValue,
  TFieldType,
  TTarget,
  Multiple extends boolean = true
> = (
  value: AutocompleteValue<TValue, Multiple>,
  current: TTarget
) => TFieldType;

/**
 * `useUpdates` hook results.
 */
export type UseUpdatesResults<TTarget> = {
  /**
   * The very basic hook which merges updates with the target value.
   */
  applyUpdates: (updates: Partial<TTarget>) => void;

  /**
   * Calculate target object updates from the new text field value. Suitable for TextArea-like inputs.
   */
  useTextInput: (
    handler: CalculateUpdatesFn<string, TTarget>,
    deps?: any[]
  ) => TextChangeHandler;

  /**
   * Calculate target object attribute from the new text field value. Suitable for TextArea-like inputs.
   */
  useTextField: <Field extends keyof TTarget>(
    field: Field,
    handler: CalculateFieldFn<string, TTarget[typeof field], TTarget>,
    deps?: any[]
  ) => TextChangeHandler;

  /**
   * Use new value directly (not from ChangeEvent) to calculate target object updates.
   */
  useInput: <TValue>(
    handler: CalculateUpdatesFn<TValue, TTarget>,
    deps?: any[]
  ) => (value: TValue) => void;

  /**
   * Calculate target object attribute from the new text field value
   */
  useFieldInput: <TValue>(
    field: keyof TTarget,
    handler: CalculateFieldFn<TValue, TTarget[typeof field], TTarget>,
    deps?: any[]
  ) => (value: TValue) => void;

  /**
   * Calculate target object updates from the autocomplete value. Suitable for Autocomplete inputs.
   */
  useAutocomplete: <TValue, Multiple extends boolean = true>(
    handler: CalculateAutocompleteFn<TValue, TTarget, Multiple>,
    deps?: any[]
  ) => AutocompleteHandler<TValue, Multiple>;

  /**
   * Calculate target object attribute from the autocomplete value. Suitable for Autocomplete inputs.
   */
  useAutocompleteField: <TValue = string, Multiple extends boolean = true>(
    field: keyof TTarget,
    handler: CalculateAutocompleteFieldFn<
      TValue,
      TTarget[typeof field],
      TTarget,
      Multiple
    >,
    deps?: any[]
  ) => AutocompleteHandler<TValue, Multiple>;
};

/**
 * Create input handlers to update an object attributes.
 */
export function useUpdates<TTarget>(
  target: TTarget,
  onChange: (updated: TTarget) => void
): UseUpdatesResults<TTarget> {
  // The very basic hook which merges updates with the target value.
  const applyUpdates = useCallback(
    (updates: Partial<TTarget>) => {
      const updated: TTarget = { ...target, ...updates };
      onChange(updated);
    },
    [target, onChange]
  );

  // Calculate target object updates from the new text field value
  function useTextInput(
    handler: CalculateUpdatesFn<string, TTarget>,
    deps: any[] = []
  ): TextChangeHandler {
    return useCallback(
      (event: TextChangeEvent) => {
        const updates: Partial<TTarget> = handler(event.target.value, target);
        applyUpdates(updates);
      },
      [applyUpdates, ...deps]
    );
  }

  // Calculate target object attribute from the new text field value
  function useTextField<Field extends keyof TTarget>(
    field: Field,
    handler: CalculateFieldFn<string, TTarget[typeof field], TTarget>,
    deps: any[] = []
  ): TextChangeHandler {
    return useTextInput((value, current) => {
      const result: Partial<TTarget> = {};
      result[field] = value === "" ? undefined : handler(value, current);
      return result;
    }, deps);
  }

  // Use new value directly (not from ChangeEvent) to calculate target object updates.
  function useInput<TValue>(
    handler: CalculateUpdatesFn<TValue, TTarget>,
    deps: any[] = []
  ): (value: TValue) => void {
    return useCallback(
      (value: TValue) => {
        const updates: Partial<TTarget> = handler(value, target);
        applyUpdates(updates);
      },
      [applyUpdates, ...deps]
    );
  }

  // Calculate target object attribute from the new text field value
  function useFieldInput<TValue>(
    field: keyof TTarget,
    handler: CalculateFieldFn<TValue, TTarget[typeof field], TTarget>,
    deps: any[] = []
  ): (value: TValue) => void {
    return useInput<TValue>((value, current) => {
      const result: Partial<TTarget> = {};
      result[field] = handler(value, current);
      return result;
    }, deps);
  }

  // Calculate target object updates from the autocomplete value. Suitable for Autocomplete inputs.
  function useAutocomplete<TValue, Multiple extends boolean>(
    handler: CalculateAutocompleteFn<TValue, TTarget, Multiple>,
    deps: any[] = []
  ): AutocompleteHandler<TValue, Multiple> {
    return useCallback<AutocompleteHandler<TValue, Multiple>>(
      (
        // React.ChangeEvent<{}> is required
        /* eslint-disable   @typescript-eslint/ban-types */
        event: React.ChangeEvent<{}>,
        values: AutocompleteValue<TValue, Multiple>
      ) => {
        const updates: Partial<TTarget> = handler(values, target);
        applyUpdates(updates);
      },
      [applyUpdates, ...deps]
    );
  }

  // Calculate target object attribute from the autocomplete value. Suitable for Autocomplete inputs.
  function useAutocompleteField<TValue, Multiple extends boolean = true>(
    field: keyof TTarget,
    handler: CalculateAutocompleteFieldFn<
      TValue,
      TTarget[typeof field],
      TTarget,
      Multiple
    >,
    deps: any[] = []
  ): AutocompleteHandler<TValue, Multiple> {
    return useAutocomplete<TValue, Multiple>(
      (value: AutocompleteValue<TValue, Multiple>, current: TTarget) => {
        const updates: Partial<TTarget> = {};
        updates[field] = handler(value, current);
        return updates;
      },
      deps
    );
  }

  return {
    applyUpdates,
    useTextInput,
    useTextField,
    useInput,
    useFieldInput,
    useAutocomplete,
    useAutocompleteField,
  };
}
