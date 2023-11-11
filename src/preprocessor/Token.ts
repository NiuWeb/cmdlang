import { Location } from "@bygdle/expr-parser"

/**
 * Preprocessor tokens are:
 * - Constant definitions
 * - Embed expressions
 */
export interface Token {
    type: "constant" | "expression"
    values: string[]
    start: Location
    end: Location
}