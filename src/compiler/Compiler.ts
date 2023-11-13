import { Parser as ExprParser } from "@bygdle/expr-parser"
import { Parser as LangParser } from "./Parser"
import { EXPR_CONST } from "./expressions"
import { CompilerOptions, Instruction, Token } from "./types"
import { Program } from "@src/cmd/command/Program"
import { Compiled, CompiledFn } from "@src/cmd/command/Compiled"

/**
 * The compiler takes a code string and transform it to a list of instructions
 * ready to be executed by the program.
 */
export class Compiler<Context, Value> {
    public exprParser = new ExprParser(ExprParser.Contexts("math", "logic"))
    public langParser = new LangParser()

    public constants = new Map<string, string>()

    /**
     * If true, the compiler will catch all errors and only
     * add them to the program log
     */
    public catch = true

    /**
     * Creates a new compiler for the given program
     */
    constructor(public program: Program<Context, Value>) { }

    /** sets the compiler program */
    public setProgram(program: Program<Context, Value>) {
        this.program = program
    }

    /**
     * Compiles a code string into a single function
     * that will run all instructions in order.
     * @returns the compiled function which returns
     * the list of all instruction results
     */
    public compileString(input: string, options: CompilerOptions = {}): Compiled<Value[]> {
        const instructions = this.preprocess(input)
        return this.compile(instructions, options)
    }

    public compile(instructions: Instruction[], options: CompilerOptions = {}): Compiled<Value[]> {
        const logger = this.program.logger
        const functions: CompiledFn<Value>[] = []

        const lineStart = Math.max(1, Math.floor(options.line || 1))

        for (const instruction of instructions) {
            // compile all instructions
            try {
                logger.setLine(instruction.start)
                logger.setLine(logger.line + lineStart - 1)
                const compiled = this.program.compile(instruction.values)
                const wrapped: CompiledFn<Value> = () => {
                    try {
                        return compiled()
                    } catch (e) {
                        if (e instanceof Error) {
                            logger.error(e.message)
                            e.message = `Error at ${instruction.start}: ${e.message}`
                        } else {
                            logger.error(String(e).valueOf())
                        }
                        if (!this.catch) {
                            throw e
                        }
                        return undefined as Value
                    }
                }
                functions.push(wrapped)
            } catch (e) {
                // add the instruction start to the error message
                if (e instanceof Error) {
                    logger.error(e.message)
                    e.message = `Error at ${instruction.start}: ${e.message}`
                } else {
                    logger.error(String(e).valueOf())
                }
                if (!this.catch) {
                    throw e
                }
            }
        }

        return Object.assign(() => functions.map(f => f()), {
            String: () => instructions.map(i => i.values.join(" ")).join("\n")
        })
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
                for (const t of token.values) {
                    if (t.type === "expression") {
                        t.value = this.evaluateExpression(t).toString()
                    }
                }

                // join tokens that are next to each other:
                // if a token starts exactly where the previous one ends,
                // they should be joined

                for (let i = 1; i < token.values.length; i++) {
                    const prev = token.values[i - 1]
                    const curr = token.values[i]

                    if (prev.end[0] === curr.start[0] && prev.end[1] === curr.start[1]) {
                        prev.value += curr.value
                        prev.end = curr.end
                        token.values.splice(i, 1)
                        i--
                    }
                }

                const parts = token.values.map(t => t.value)

                result.push({
                    start: token.start,
                    end: token.end,
                    values: parts
                })
            }
        }

        return result
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

        // add line breaks at the beginnig
        input = "\n".repeat(token.start[0] - 1) + " ".repeat(token.start[1] - 1) + input

        const expr = this.exprParser.parse(input)
        if (expr.length === 0) {
            return 0
        } else {
            return expr.evaluate(expr.length - 1)
        }
    }
}