import { StringLines } from "@bygdle/expr-parser"
import { Token } from "./Token"
import { Parser as ExprParser } from "@bygdle/expr-parser"
import { Dictionary } from "@src/globals/globals"

export class Parser {
    private table: StringLines
    public readonly ExprParser: ExprParser = new ExprParser(
        ExprParser.Contexts("logic", "math")
    )
    public readonly Constants: Dictionary<string> = {}

    constructor(public input: string) {
        this.table = new StringLines(input)
        this.evalConstant
    }

    private evalConstant(token: Token) {
        const [name, value] = token.values
        if (this.Constants[name]) {
            throw new Error(`constant ${name} already defined`)
        }

        this.Constants[name] = value

    }

    public findTokens() {
        const tokens = [
            ...this._findTokens("constant", /const\s+\$([a-z_][a-z0-9_]*)\s+(.*)/ig),
            ...this._findTokens("expression", /\{([^}]*)\}/igm)
        ]
        
        StringLines.sortByLocation(tokens, token => token.start)
        // if two tokens are in the same line,
        // then put always the constant last
        tokens.sort((a, b) => {
            if (a.start[0] === b.start[0]) {
                if (a.type === "constant") return 1
                if (b.type === "constant") return -1
            }
            return 0
        })
        return tokens
    }

    private _findTokens(type: "constant" | "expression", expr: RegExp): Token[] {
        const input = this.input
        const tokens: Token[] = []

        const match = input.matchAll(expr)
        for (const m of match) {
            const values = Array.from(m)

            if (m.index === undefined) {
                throw new Error("match.index is undefined")
            }

            const start = this.table.getLocation(m.index)
            const end = this.table.getLocation(m.index + m[0].length)

            tokens.push({
                type,
                values,
                start,
                end
            })
        }
        return tokens
    }
}