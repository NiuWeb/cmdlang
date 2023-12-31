import { Dictionary } from "@src/globals/globals"
import { Command } from "./Command"
import { Compiled } from "./Compiled"
import { ArgumentParser } from "../arguments/ArgumentParser"
import { Logger } from "@src/logger/Logger"
import { Expression } from "@bygdle/expr-parser"
import { ArgumentGetter } from "../arguments/ArgumentGetter"

/**
 * A program contains a tree of commands, and a context
 * which is a value passed to all commands.
 * The program can compile a list of strings to a function
 * which will run the command.
 */
export class Program<Context, Value = void> {

    public logger = Logger.Global

    /**
     * Creates a new program
     * @param context The program context
     * @param commands The command tree
     */
    constructor(public context: Context, public commands: Dictionary<Command<Context, Value>>) {
    }


    /**
     * Given a list of names, finds the innermost command.
     * Where the first name is the root command, the next is
     * one of its children and so on. Also returns the list
     * of names that were not found.
     * @returns [command, remainingNames, commandPath]
     */
    public findCommand(names: string[]): [Command<Context, Value> | undefined, string[], string[]] {
        if (!this.commands[names[0]]) return [undefined, names, []]

        let cmd: Command<Context, Value> | undefined = this.commands[names[0]]
        let i = 1
        while (cmd && i < names.length) {
            if (!cmd.children?.[names[i]]) break
            cmd = cmd.children[names[i]]
            i++
        }

        return [cmd, names.slice(i), names.slice(0, i)]
    }


    /**
     * Compiles the parts of an instruction to a compiled command.
     */
    public compile(parts: string[], _expressions: (Expression | undefined)[] = []): Compiled<Value> {
        const origin = parts.join(" ")
        const [cmd, rem, cmdpath] = this.findCommand(parts)

        const expressions = [..._expressions]
        expressions.splice(0, cmdpath.length)

        if (!cmd) {
            throw new Error(`command not found: ${parts.join(" ")}`)
        }

        const fn = cmd.compile
        if (!fn) {
            throw new Error(`command not implemented: ${parts.join(" ")}`)
        }

        const parser = new ArgumentParser(cmd.arguments || "", cmd.docs)
        const args = parser.parseList(rem)
        const get = new ArgumentGetter(args, expressions)
        const input = { ...args, expressions, get }


        return Object.assign(fn(input, this), {
            String: () => origin
        })
    }
}