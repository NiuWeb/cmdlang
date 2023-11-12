import { Parser as ExprParser } from "@bygdle/expr-parser"
import { Parser as LangParser } from "./Parser"
import { EXPR_CONST } from "./expressions"
import { Instruction, Token } from "./Token"
import { Program } from "@src/cmd/command/Program"

/**
 * The compiler takes a code string and transform it to a list of instructions
 * ready to be executed by the program.
 */
export class Compiler<Context, Value> {
    public exprParser = new ExprParser(ExprParser.Contexts("math", "logic"))
    public langParser = new LangParser()

    public constants = new Map<string, string>()

    /**
     * Creates a new compiler for the given program
     */
    constructor(public program: Program<Context, Value>) {
        this.program = program
    }

    /**
     * Replaces all constants in the form `$name` with their value.
     * If a constant name is not found, it is left as is.
     * @param input The input to replace in
     * @param numberOnly If true, only constants with a number value will be replaced
     * @returns The input with constants replaced
     */
    private replaceConstants(input: string, numberOnly = false) {
        return input.replace(EXPR_CONST, (match) => {
            const value = this.constants.get(match)
            if (value === undefined) return match

            if (numberOnly) {
                let num = parseFloat(value)
                if (value.endsWith("%")) {
                    num /= 100
                }
                if (Number.isFinite(num)) {
                    return num.toString()
                } else {
                    return match
                }
            }

            return value
        })
    }

    /**
     * Evaluates an expression with the constants replaced and using
     * the expression parser.
     * If the string outputs multiple expressions, only the last
     * one is returned.
     */
    private evaluateExpression(token: Token) {
        let input = token.value
        input = this.replaceConstants(input, true)

        const expr = this.exprParser.parse(input)
        if (expr.length === 0) {
            return 0
        } else {
            return expr.evaluate(expr.length - 1)
        }
    }
    /**
     * Takes a code string, evaluates the constant declarations
     * and expressions, and returns the evaluated code.
     * Instructions are not evaluated, this is just a
     * replacement step.
     * @returns A list of preprocessed instructions, with
     * all constants and expressions evaluated and replaced.
     */
    public preprocess(input: string): Instruction[] {
        const parsed = this.langParser.parse(input)
        const result: Instruction[] = []

        for (const token of parsed) {
            // constant tokens
            if (token.type === "constant") {
                const nameToken = token.values[0]
                const valueToken = token.values[1]

                const name = nameToken.value

                if (this.constants.has(name)) {
                    throw new Error(`cannot redefine constant "${name}" at ${nameToken.start}`)
                }

                // evaluate constant value if it's an expression
                if (valueToken.type === "expression") {
                    const value = this.evaluateExpression(valueToken)
                    this.constants.set(name, value.toString())
                } else { // otherwise just set it
                    this.constants.set(name, valueToken.value)
                }
            } else {
                // for an instruction token, evaluate all expressions
                const parts = token.values.map(child => {
                    if (child.type === "expression") {
                        return this.evaluateExpression(child).toString()
                    } else {
                        return child.value
                    }
                })

                result.push({
                    start: token.start,
                    end: token.end,
                    values: parts
                })
            }
        }

        return result
    }
}