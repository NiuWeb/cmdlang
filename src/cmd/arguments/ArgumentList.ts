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
     * Position of the named arguments in the original parts
     */
    namedPos: Dictionary<number>
    /**
     * Original parts
     */
    parts: string[]
}