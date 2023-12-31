import { Dictionary } from "@src/globals/globals"
import { Argument } from "./Argument"
import { ArgumentList } from "./ArgumentList"
import { CmdSplit } from "../utils/split"

/**
 * A parser for a list of arguments.
 * 
 * - Basic arguments list:
 * `arg1 arg2 arg3 ...`
 * 
 * - Named arguments list:
 * `arg1_name= arg2_name= arg3_name= ...`
 * 
 * The difference between the two is that the first one is positional
 * while the second one is not. This means, the arguments defined
 * in the first way will be accessed by their position in the list,
 * while the arguments defined in the second way will be accessed
 * by their name.
 * 
 * - Optional arguments list:
 * `arg1 arg2 arg3 [arg4] [arg5] ...`
 * 
 * - Optional named arguments list:
 * `arg1_name= arg2_name= arg3_name= [arg4_name=] [arg5_name=] ...`
 * 
 * Optional arguments won't throw an error if they are not provided.
 * Also, optional named arguments can be provided in any order, but
 * optional positional arguments can only be provided at the end of
 * the list.
 * 
 * If you include a final argument with suffix `...`, it will 
 * allow you to provide any maximum number of arguments.
 * 
 * - A special case for named arguments: `[ArgumentName*=]` will allow you to
 * provide any number of named arguments with any name.
 * 
 * Some examples:
 * 
 * ```
 * template: name age
 * usage:
 * john 20
 * ```
 * or
 * ```
 * template: name= age=
 * usage:
 * name=john age=20
 * age=20 name=john
 * ```
 * or
 * ```
 * template: name= age= [gender=]
 * usage:
 * name=john age=20
 * age=20 name=john
 * gender=male name=john age=20
 * ```
 */
export class ArgumentParser {
    private positional: Argument[] = []
    private named: Argument[] = []
    private anyNamed = false
    private min = 0
    private max = 0

    /**
     * Creates and parses an arguments parser.
     * @param template The template string. Read the class description for more info.
     * @param docs A dictionary of documentation with extended descriptions for the arguments.
     */
    constructor(public template: string, private docs?: Readonly<Dictionary>) {
        this.parseTemplate()
    }

    /**
     * resets list data
     */
    private reset() {
        this.positional = []
        this.named = []
        this.min = 0
        this.max = 0
    }

    /**
     * gets the arguments list from the template string
     */
    private parseTemplate() {
        const parts = CmdSplit(this.template.trim())
        const expr = /^\[([^\]]*)\]$/

        let previous: Argument | undefined = undefined

        for (let arg of parts) {
            const match = arg.match(expr)
            const optional = !!match
            if (optional) {
                arg = match![1]
            }
            const argParts = arg.split("=")
            const positional = argParts.length === 1 // positional arguments have no '='
            const name = argParts.shift()
            const extra = argParts.join("=")

            if (!name) { // both positional and named have an argument name
                throw new Error(`Invalid argument name: ${arg}`)
            }

            if (name.endsWith("...")) {
                if (!positional) {
                    throw new Error(`Named arguments cannot have suffix '...': ${name}`)
                }
                this.max = Infinity
            }

            if (!positional && optional && name.endsWith("*")) {
                this.anyNamed = true
            }

            // re-create the argument label
            let label = name
            if (!positional) {
                label += "=" + extra
            }
            if (optional) {
                label = "[" + label + "]"
            }

            const argument: Argument = {
                label,
                name,
                positional,
                optional,
                description: this.docs?.[name]
            }

            if (argument.positional) {
                if (previous) {
                    if (previous.optional && !argument.optional) {
                        throw new Error(`Optional arguments must be at the end of the positional list: ${previous.name}`)
                    }
                    if (previous.name.endsWith("...")) {
                        throw new Error(`'...' argument must be at the end of the list: ${previous.name}`)
                    }
                }
                previous = argument
                this.positional.push(argument)

                if (!argument.optional && !argument.name.endsWith("...")) {
                    this.min++
                }
                this.max++
            } else {
                this.named.push(argument)
            }
        }
    }

    /**
     * Prints the arguments list as a string.
     */
    public toString() {
        let str = ""

        for (const arg of this.positional) {
            str += arg.label + " "
        }

        for (const arg of this.named) {
            str += arg.label + " "
        }

        return str.trim()
    }

    /**
     * Changes the arguments list template.
     */
    public setTemplate(template: string) {
        this.reset()
        this.template = template
        this.parseTemplate()
    }

    /**
     * Changes the documentation dictionary.
     */
    public setDocs(docs: Dictionary) {
        this.docs = docs

        for (const arg of this.positional) {
            arg.description = docs[arg.name]
        }

        for (const arg of this.named) {
            arg.description = docs[arg.name]
        }
    }

    /**
     * Parses a string with a list of arguments, throws if invalid.
     */
    public parse(argstring: string): ArgumentList {
        const list = this._parse(CmdSplit(argstring.trim()))
        this._validate(list)
        return list
    }

    /**
     * Parses a list of arguments, throws if invalid.
     */
    public parseList(parts: string[]): ArgumentList {
        const list = this._parse(parts)
        this._validate(list)
        return list
    }

    /**
     * Parses a list of arguments.
     */
    private _parse(parts: string[]): ArgumentList {
        const values: string[] = []
        const named: Dictionary = {}
        const index: Dictionary<number, number | string> = {}

        for (let i = 0; i < parts.length; i++) {
            const arg = parts[i]
            if (arg.includes("=")) {
                const [name, value] = arg.split("=")
                named[name] = value
                index[name] = i
            } else {
                values.push(arg)
                index[i] = i
            }
        }
        return { values, named, index, parts }
    }

    /**
     * validates a list of arguments
     */
    private _validate(list: ArgumentList) {
        if (list.values.length < this.min) {
            throw new Error(`Expected at least ${this.min} positional arguments, got ${list.values.length}`)
        }
        if (list.values.length > this.max) {
            throw new Error(`Expected at most ${this.max} positional arguments, got ${list.values.length}`)
        }

        // skip named arguments validation if anyNamed is true
        if (this.anyNamed) {
            return
        }

        // validate named arguments
        const namedWant = this.named.map(arg => arg.name)
        const namedHave = Object.keys(list.named)

        for (const name of namedHave) {
            if (!namedWant.includes(name)) {
                throw new Error(`Unexpected named argument: ${name}`)
            }
        }

        for (const name of namedWant) {
            const arg = this.named.find(arg => arg.name === name)!
            if (!arg.optional && !namedHave.includes(name)) {
                throw new Error(`Expected named argument: ${name}`)
            }
        }
    }

    /**
     * Minimum number of positional arguments.
     */
    public get argMin() {
        return this.min
    }

    /**
     * Maximum number of positional arguments.
     */
    public get argMax() {
        return this.max
    }

    /**
     * Gets all the named arguments.
     */
    public get namedArgs(): readonly Readonly<Argument>[] {
        return this.named
    }
}