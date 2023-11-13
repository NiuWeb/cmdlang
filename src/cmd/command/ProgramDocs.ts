import { CmdSplit } from "../utils/split"
import { Command } from "./Command"
import { Program } from "./Program"

/**
 * Documentation generator for a program.
 */
export class ProgramDocs {
    /**
     * Creates a new documentation generator.
     * @param program The program to document
     */
    constructor(public program: Program<unknown>) { }

    /**
     * Generates markdown documentation for a program command,
     * or the whole program if no parts are given.
     * @param parts The command parts
     */
    public markdown(parts?: string | string[]) {
        if (typeof parts === "string") {
            parts = CmdSplit(parts)
        }
        return this.doc(parts, true)
    }

    /**
     * Generates text documentation for a program command,
     * or the whole program if no parts are given.
     * @param parts The command parts
     */
    public text(parts?: string | string[]) {
        if (typeof parts === "string") {
            parts = CmdSplit(parts)
        }
        return this.doc(parts, false)
    }


    /**
     * Gets all the full commands, including subcommands.
     */
    public allCommands(): string[] {
        const result : string[] = []

        function recurse(cmd: Command<unknown>, parts: string[] = []) {
            if (cmd.children) {
                for (const name in cmd.children) {
                    recurse(cmd.children[name], [...parts, name])
                }
            } else {
                result.push(parts.join(" "))
            }
        }

        for (const name in this.program.commands) {
            recurse(this.program.commands[name], [name])
        }

        return result
    }


    private doc(parts?: string[], markdown = false) {
        if (!parts) {
            let text = ""
            for (const name in this.program.commands) {
                text += this.command([name], markdown) + "\n\n"
            }

            return text
        }

        return this.command(parts, markdown)
    }

    private command(parts: string[], markdown = true): string {
        const [cmd, , cmdParts] = this.program.findCommand(parts)
        const fullName = cmdParts.join(" ")
        if (!cmd) {
            return `Command not found: \`${parts.join(" ")}\``
        }

        let text = ""

        if (markdown) {
            text += "## "
        }

        text += "command `" + fullName + "`\n\n"
        text += cmd.description || ""
        text += "\n\n"

        if (markdown) {
            text += "### "
        }

        text += "Syntax:\n\n"

        if (markdown) {
            text += "```\n"
        }

        text += fullName + " " + (cmd.arguments || "").trim() + "\n"

        if (markdown) {
            text += "```\n"
        }
        text += "\n"

        if (markdown) {
            text += "### "
        }

        text += "Arguments:\n\n"

        let len = 0
        for (const arg in cmd.docs) {
            text += "- `" + arg + "`: " + cmd.docs[arg] + "\n"
            len++
        }
        if (len === 0) {
            text += "No arguments\n"
        }


        if (cmd.example) {
            if (markdown) {
                text += "### "
            }

            text += "Examples:\n\n"

            const examples = typeof cmd.example === "string" ? [cmd.example] : cmd.example
            for (const example of examples) {
                if (markdown) {
                    text += "```\n"
                }

                text += example + "\n"

                if (markdown) {
                    text += "```\n"
                }
            }
        }

        if (cmd.children) {
            if (markdown) {
                text += "### "
            }

            text += "Subcommands:\n\n"

            for (const name in cmd.children) {
                text += "- `" + fullName + " " + name + "`\n"
            }

            text += "\n"
        }

        return text
    }
}