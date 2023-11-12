import { Location } from "@bygdle/expr-parser"

/**
 * Preprocessor tokens are:
 * - Constant definitions
 * - Brackets for opening and closing expressions
 * - Replacements for already processed constants or expressions
 */

export interface Token {
    start: Location
    end: Location
    type: "bracketOpen" | "bracketClose" | "constant" | "replacement"
    values: string[]
}