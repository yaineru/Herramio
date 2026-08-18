export type FieldType = "text" | "tel" | "email" | "url" | "textarea" | "select" | "checkbox";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | boolean;
  options?: FieldOption[];
  helpText?: string;
  maxLength?: number;
}

export type FieldValues = Record<string, string | boolean>;

export function initialValuesFromFields(fields: FieldConfig[]): FieldValues {
  const values: FieldValues = {};
  for (const field of fields) {
    values[field.name] = field.defaultValue ?? (field.type === "checkbox" ? false : "");
  }
  return values;
}
