import { Location } from "@bygdle/expr-parser"

export interface Token {
    type: "part" | "expression"
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
}