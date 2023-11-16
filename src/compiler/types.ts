import { Expression, Location } from "@bygdle/expr-parser"

export interface Token {
    type: "part" | "expression"
    /**
     * If the token is marked as post-process, the
     * expression won't be evaluated at the pre-processing.
     * Instead, it only will parsed, and passed to the
     * instruction to be evaluated at runtime.
     */
    expression?: Expression
    value: string
    start: Location
    end: Location
}

export interface Parsed {
    type: "constant" | "instruction"
    values: Token[]
    start: Location
    end: Location
}


export interface Instruction {
    start: Location
    end: Location
    values: string[]
    expressions: (Expression | undefined)[]
}


export interface CompilerOptions {
    /**
     * If set, line count will start at this number.
     */
    line?: number
}