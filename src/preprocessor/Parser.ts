import { StringLines, Parser as ExprParser } from "@bygdle/expr-parser"
import { Token } from "./Token"
import { EXPR_CONST_REPLACE, EXPR_CONST_DEFINE, EXPR_CONST_BRACKET } from "./expressions"
import { RemoveComments } from "./comments"


/**
 * The preprocessor parser will apply constant definitions
 * and embedded math expressions to the source code, 
 * BEFORE the command instructions are evaluated.
 */
export class Parser {
    
    private input = ""
    private table = new StringLines("")
    private tokens: Token[] = []
    public readonly constants = new Map<string, string>()

    /**
     * Creates a new preprocessor parser for the given source code.
     */
    constructor(private exprParser: ExprParser) {
    }

    public parse(input: string) {
        this.input = RemoveComments(input)
        this.table = new StringLines(input)
        this.tokens = this.scan()
        this._parse()
    }


    public getTokens(): readonly Readonly<Token>[] {
        return this.tokens
    }

    /**
     * Gets the value of a constant
     */
    public getConstant(name: string): string | undefined {
        return this.constants.get(name)
    }

    /**
     * Recieves a string and replaces all found constants with their values.
     * Not found constants will be left untouched.
     * @param input The string to replace the constants in.
     * @param onlyNumbers If true, only constants that are numbers will be replaced.
     */
    private replaceConstant(input: string, onlyNumbers = false): string {
        return input.replace(EXPR_CONST_REPLACE, (match, name) => {
            const value = this.constants.get(name)
            if (value === undefined) {
                return match
            }

            if (onlyNumbers) {
                let num = parseFloat(value)
                if (value.endsWith("%")) {
                    num /= 100
                }
                if (!Number.isFinite(num)) {
                    return match
                }
                return num.toString()
            }

            return value
        })
    }

    /**
     * Takes the content between the open and close bracket tokens,
     * replaces all constants in it and evaluates the expression.
     * @param open The open bracket token
     * @param clos The close bracket token
     * @returns The evaluated expression
     */
    private replaceExpression(open: Token, close: Token): string {
        const parser = this.exprParser
        const input = this.input
        const table = this.table

        if (!open || open.type !== "bracketOpen") {
            throw new Error(`expected '{' to open a block at ${open.start}`)
        }
        if (!close || close.type !== "bracketClose") {
            throw new Error(`expected '}' to close the block at ${open.start}`)
        }

        // take the content between the open and close
        const startIndex = table.getIndex(open.end)
        const endIndex = table.getIndex(close.start)

        // keep whitespaces to preserve the line numbers
        // for the expression parser
        let content =
            "\n".repeat(open.start[0] - 1) +
            " ".repeat(open.start[1] - 1) +
            input.slice(startIndex, endIndex)

        // replace constants in the content
        content = this.replaceConstant(content, true)

        // parse and evaluate the expression
        const expr = parser.parse(content)
        if (expr.length === 0) {
            content = ""
        } else {
            content = expr.evaluate(expr.length - 1).toString()
        }

        return content
    }


    /**
     * Replaces all constant defintions and expressions with
     * their evaluated values.
     */
    public preprocess() {
        const newTokens: Token[] = []

        // connect all the input parts that are not tokens
        // and therefore not saved by the scanner.
        // Between one token and the next may be one of
        // those parts, so we need to get it and save it
        // in between.
        for(let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i]
            newTokens.push(token)
            const next = this.tokens[i + 1]
            if(!next) {
                break
            }

            const start = this.table.getIndex(token.end) + 1
            const end = this.table.getIndex(next.start)

            const startPos = this.table.getLocation(start)
            const endPos = this.table.getLocation(end)

            newTokens.push({
                start: startPos,
                end: endPos,
                type: "replacement",
                values: [this.input.slice(start, end)]
            })
        }
    
        // connect the last token with the end of the input
        const last = this.tokens[this.tokens.length - 1]
        const end = this.table.getIndex(last.end)
        const endPos = this.table.getLocation(end)

        newTokens.push({
            start: last.end,
            end: endPos,
            type: "replacement",
            values: [this.input.slice(end)]
        })

        let output = ""

        for(const token of newTokens) {
            const start = this.table.getIndex(token.start)
            const end = this.table.getIndex(token.end)

            const value = token.values.join("")

            const nlines = Math.max(0, start - output.length + 1)
            output += " ".repeat(nlines)

            output += value

            const nwhites = Math.max(0, (end - start) - value.length)
            output += " ".repeat(nwhites)
        }

        output = this.replaceConstant(output)

        return output
    }

    /**
     * Parses the scanned tokens and evaluates all constants and expressions.
     */
    private _parse() {
        const tokens = this.tokens
        let open: Token | undefined = undefined

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]

            if (token.type === "constant") {
                const name = token.values[1].trim().toLowerCase()
                if (open) {
                    throw new Error(`cannot define constant '${token.values[1]}' inside a block at ${token.start}`)
                }

                // if next to a constant definition is a bracket open
                // in the same line, then the code block inside the brackets
                // must be evaluated and the result must be assigned to the constant.

                // Otherwise, the constant value will be the string after the constant name

                const next = tokens[i + 1]
                if (next && next.start[0] === token.start[0] && next.type === "bracketOpen") {
                    // next to the constant is a bracket open

                    //next to the open should be the close
                    const close = tokens[i + 2]
                    const content = this.replaceExpression(next, close)

                    // assign the result to the constant
                    if(this.constants.has(name)) {
                        throw new Error(`cannot redefine constant '${token.values[1]}' at ${token.start}`)
                    }
                    this.constants.set(name, content)

                    // remove the open and close tokens
                    tokens.splice(i + 1, 2)

                    // mark the constant as a replacement token
                    token.type = "replacement"
                    token.values = []
                    token.end = close.end
                } else {
                    // next to the constant is not a bracket open
                    // so the constant value is the string after the constant name
                    const value = token.values[2]

                    // assign the result to the constant
                    if(this.constants.has(name)) {
                        throw new Error(`cannot redefine constant '${token.values[1]}' at ${token.start}`)
                    }

                    this.constants.set(name, value)

                    // mark the constant as a replacement token
                    token.type = "replacement"
                    token.values = []
                    token.end[1] = this.table.getLineLength(token.end[0])
                }

            } else if (token.type === "bracketOpen") {
                if (open) {
                    throw new Error(`expected '}' to close the block before opening a new block at ${token.start}`)
                }
                open = token
            } else if (token.type === "bracketClose") {
                if (!open) {
                    throw new Error(`expected '{' to open a block at ${token.start}`)
                }

                // get the expression value
                const close = token
                const content = this.replaceExpression(open, close)

                // use the open token as a replacement token
                open.type = "replacement"
                open.values = [content]
                open.end = close.end

                // remove the close token
                tokens.splice(i, 1)
                i--

                // close the block
                open = undefined
            }
        }
    }

    /**
     * Find all constant definitions and bracket tokens in the source code.
     */
    private scan() {
        const input = this.input
        const table = this.table

        const tokens: Token[] = []

        const consts = input.matchAll(EXPR_CONST_DEFINE)
        const brackets = input.matchAll(EXPR_CONST_BRACKET)

        for (const match of consts) {
            if (match.index === undefined) {
                continue
            }
            tokens.push({
                start: table.getLocation(match.index),
                end: table.getLocation(match.index + match[0].length),
                type: "constant",
                values: Array.from(match)
            })
        }

        for (const match of brackets) {
            if (match.index === undefined) {
                continue
            }
            tokens.push({
                start: table.getLocation(match.index),
                end: table.getLocation(match.index + match[0].length),
                type: match[0] === "{" ? "bracketOpen" : "bracketClose",
                values: [match[0]]
            })
        }

        StringLines.sortByLocation(tokens, token => token.start)

        return tokens
    }
}