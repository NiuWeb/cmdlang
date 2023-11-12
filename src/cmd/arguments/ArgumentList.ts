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
     * Original parts
     */
    parts: string[]
}