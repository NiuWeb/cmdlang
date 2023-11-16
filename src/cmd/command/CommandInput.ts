import { Expression } from "@bygdle/expr-parser"
import { ArgumentList } from "../arguments/ArgumentList"
import { ArgumentGetter } from "../arguments/ArgumentGetter"

export interface CommandInput extends ArgumentList {
    /**
     * post-processed non-evaluated expressions
     */
    expressions: (Expression | undefined)[]

    /**
     * Shortcut for getting numeric values
     */
    get: ArgumentGetter
}