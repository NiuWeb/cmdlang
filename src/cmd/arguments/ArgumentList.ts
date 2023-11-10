import { Dictionary } from "@src/globals/globals"

/**
 * A parsed argument list
 */
export interface ArgumentList {
    values: string[]
    named: Dictionary
}