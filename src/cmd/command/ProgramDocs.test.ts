import { Program } from "./Program"
import { ProgramDocs } from "./ProgramDocs"

const prog = new Program(0, {
    "age": {
        name: "age",
        description: "Controls the age",
        children: {
            "set": {
                name: "set",
                description: "Sets the age",
                arguments: "value [named=value]",
                docs: {
                    value: "The age to set",
                    named: "A named argument optional",
                }
            },
            "old": {
                name: "old",
                description: "Makes the age old",
                children: {
                    "enable": {
                        name: "enable"
                    },
                    "disable": {
                        name: "disable"
                    }
                }
            },
            "young": {
                name: "young",
                description: "Makes the age young",
            },
            "another-command": {
                name: "name with spaces",
                description: "Sets the name and age",
                arguments: "name age",
                docs: {
                    name: "The name to set",
                    age: "The age to set",
                },
            }
        }
    },
})

const docs = new ProgramDocs(prog)

test("markdown text documentation", () => {
    console.log(docs.markdown("age set"))
})

test("all commands", () => {
    console.log(docs.allCommands())
})