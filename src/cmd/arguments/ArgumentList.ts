import { Dictionary } from "@src/globals/globals"

/**
 * A parsed argument list
 */
export interface ArgumentList {
    /**
     * Positional arguments values
     */
    values: string[]
    /**
     * Named arguments values
     */
    named: Dictionary
    /**
     * Index of the positional and named arguments in the original parts
     */
    index: Dictionary<number, number | string>
    /**
     * Original parts
     */
    parts: string[]
}