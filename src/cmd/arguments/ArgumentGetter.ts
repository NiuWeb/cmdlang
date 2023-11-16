import { Expression } from "@bygdle/expr-parser"
import type { ArgumentList } from "./ArgumentList"
import { toNumber } from "@src/globals/toNumber"

export class ArgumentGetter {

    constructor(public list: ArgumentList, public expressions: (Expression | undefined)[]) {}

    public number(nameOrIndex: number | string) {
        const index = this.list.index[nameOrIndex]
        const expr = this.expressions[index]
        if (expr) return expr.evaluate(expr.length - 1)
        if( typeof index === "number" ) return toNumber(this.list.values[index])
        return toNumber(this.list.named[nameOrIndex])
    }

    public expression(nameOrIndex: number | string) {
        const index = this.list.index[nameOrIndex]
        return this.expressions[index]
    }

}