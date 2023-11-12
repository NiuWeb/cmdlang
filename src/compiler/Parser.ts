import { StringLines } from "@bygdle/expr-parser"
import { RemoveComments } from "./comments"
import { EXPR_BLOCK_EXPRESSION, EXPR_BLOCK_QUOTE, EXPR_BLOCK_QUOTE_NAMED, EXPR_PART } from "./expressions"
import { Parsed, Token } from "./types"
import { validateConstantTokens } from "./utils"

/**
 * The language parser. Will identify constant declarations,
 * instructions and expressions.
 */
export class Parser {
    private input = ""
    private table = new StringLines("")
    private _tokens: Token[] = []

    /**
     * Parses a code string and returns the parsed tokens for
     * constants, instructions and expressions.
     */
    public parse(input: string) {
        this.input = RemoveComments(input.toLowerCase())
        this.table = new StringLines(this.input)
        this._tokens = []

        this.validateBrackets()
        this.scan(EXPR_BLOCK_EXPRESSION, "expression")
        this.scan(EXPR_BLOCK_QUOTE_NAMED, "part")
        this.scan(EXPR_BLOCK_QUOTE, "part")
        this.scan(EXPR_PART, "part")

        StringLines.sortByLocation(this._tokens, token => token.start)

        return this._parse()
    }

    /**
     * Gets the scanned tokens. Readonly.
     */
    public get tokens(): readonly Readonly<Token>[] {
        return this._tokens
    }


    /**
     * Checks if the brackets are balanced, throws an error if not
     */
    public validateBrackets(): void {
        let open = false

        for (let i = 0; i < this.input.length; i++) {
            const char = this.input[i]
            const loc = this.table.getLocation(i)

            if (char === "{") {
                if (open) throw new Error(`cannot open block at ${loc} because another block is already open`)
                open = true
            } else if (char === "}") {
                if (!open) throw new Error(`cannot close block at ${loc} because no block is open`)
                open = false
            }
        }
    }

    /**
     * Finds all matches in the input and saves them as tokens.
     * The matches are removed from the input.
     */
    public scan(expr: RegExp, type: Token["type"]): void {
        const matches = this.input.matchAll(expr)

        for (const match of matches) {
            const startPos = match.index
            if (startPos === undefined) continue

            const endPos = startPos + match[0].length
            // get line/col position
            const start = this.table.getLocation(startPos)
            const end = this.table.getLocation(endPos)

            // get the expression content
            const value = match[1]

            // remove the expression from the input
            this.input = this.input.slice(0, startPos) + " ".repeat(match[0].length) + this.input.slice(endPos)

            this._tokens.push({
                type,
                value,
                start,
                end
            })
        }
    }

    /**
     * parses the scanned tokens
     */
    private _parse() {
        const parsed: Parsed[] = []

        let lastStartLine = 0
        let lastEndLine = 0

        let instruction: Token[] = []

        function addInstruction(defaultToken: Token) {
            // if the previous token is a backslash, ignore the line break
            if (instruction[instruction.length - 1]?.value === "\\") {
                // remove the backslash
                instruction.pop()
            } else if (instruction.length > 0) {
                // start a new instruction
                const values = [...instruction]
                const start = values[0]?.start || defaultToken.start
                const end = values[values.length - 1]?.end || defaultToken.end
                parsed.push({
                    type: "instruction",
                    values,
                    start,
                    end
                })
                instruction = []
            }
        }

        for (let i = 0; i < this._tokens.length; i++) {
            const token = this._tokens[i]

            // parse constants: "const $x 150%"
            // constants require 3 consecutive tokens
            if (token.type === "part" && token.value === "const") {
                if (token.start[0] === lastStartLine) {
                    throw new Error(`constants must be declared on their own line at ${token.start}`)
                }

                const nameToken = this._tokens[i + 1]
                const valueToken = this._tokens[i + 2]

                validateConstantTokens(token, nameToken, valueToken)

                parsed.push({
                    type: "constant",
                    values: [nameToken, valueToken],
                    start: token.start,
                    end: valueToken.end
                })

                i += 2
            } else { // everything not in a constand declaration is an instruction
                // for tokens to be in the same instruction,
                // the next token must start on the same line as
                // the previous token ended

                if (token.start[0] !== lastEndLine) { // if tokens are not on the same line,
                    addInstruction(token) // start a new instruction
                }
                instruction.push(token)
            }

            lastStartLine = token.start[0]
            lastEndLine = token.end[0]
        }

        // add the last instruction
        if (this.tokens.length > 0) {
            addInstruction(this._tokens[this._tokens.length - 1])
        }

        StringLines.sortByLocation(parsed, token => token.start)
        return parsed
    }


}