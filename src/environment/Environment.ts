import { Parser as ExprParser } from "@bygdle/expr-parser"
import { Compiled } from "@src/cmd/command/Compiled"
import { Program } from "@src/cmd/command/Program"
import { CmdSplit } from "@src/cmd/utils/split"
import { Parser as Preprocessor } from "@src/preprocessor/Parser"

/**
 * Properties for an environment
 */
export interface EnvironmentProps<Context, Value> {
    /**
     * The object that will parse the embedded math expressions
     */
    parser: ExprParser
    /**
     * The program that will run the commands
     */
    program: Program<Context, Value>
}

/**
 * An environment combines a command-line program with a math expression parser,
 * it is the main class that will run the code.
 */
export class Environment<Context, Value> {

    public readonly parser: ExprParser
    public readonly program: Program<Context, Value>
    public readonly preprocessor: Preprocessor

    /**
     * Creates a new environment
     */
    constructor(props: EnvironmentProps<Context, Value>) {
        this.parser = props.parser
        this.program = props.program
        this.preprocessor = new Preprocessor(this.parser)
    }

    /**
     * Compiles a string to a function that will run all the commands,
     * line by line, and return the values of each command.
     */
    compile(input: string): Compiled<Value[]> {
        this.preprocessor.parse(input)
        input = this.preprocessor.preprocess()

        console.log(`preprocessed: \n"${input}"`)

        const lines = input.split("\n")
        const fns: Compiled<Value>[] = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.trim().length === 0) continue

            const parts = CmdSplit(line)

            // wrap in try-catch to add the line number to the error
            try {
                const compiled = this.program.compile(parts)
                fns.push(compiled)
            } catch (_e) {
                const e = _e as Error
                throw new Error(`Error on line ${i + 1}: ${e.message}`)
            }
        }

        return () => {
            const values: Value[] = []
            for (const fn of fns) {
                values.push(fn())
            }
            return values
        }
    }
}