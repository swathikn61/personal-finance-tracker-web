import type { ValueTransformer } from "typeorm";

// pg returns decimal columns as strings, so turn them back into numbers for the API
export const decimalTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value: string) => parseFloat(value),
};
