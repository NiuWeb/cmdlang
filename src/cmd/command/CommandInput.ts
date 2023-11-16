import { Expression } from "@bygdle/expr-parser"
import { ArgumentList } from "../arguments/ArgumentList"

export interface CommandInput extends ArgumentList {
    /**
     * post-processed non-evaluated expressions
     */
    expressions: (Expression | undefined)[]
}