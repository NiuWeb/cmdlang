/**
 * A dictionary in the form `key:value`
 */
export type Dictionary<Value = string, Key extends string | number | symbol = string> = { [key in Key]: Value }