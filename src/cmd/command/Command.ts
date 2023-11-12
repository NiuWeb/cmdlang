import { Dictionary } from "@src/globals/globals"
import { Compiled } from "./Compiled"
import { CommandInput } from "./CommandInput"
import type { Program } from "./Program"

/**
 * Definition of a single command.
 * A command is an action that can be compiled once, and then run multiple times.
 */
export interface Command<Context = void, Value = void> {
    /** command name */
    name: string
    /** command doc description */
    description?: string
    /** command arguments list template string. Read `ArgumentParser` class docs for more info */
    arguments?: string
    /** documentation dictionary for the arguments */
    docs?: Dictionary
    /** subcommands */
    children?: Dictionary<Command<Context, Value>>

    /** 
     * the compile function. Will recieve the command arguments and
     * return a function that should be able to execute multiple times.
     */
    compile?(input: CommandInput, program: Program<Context, Value>): Compiled<Value>
}