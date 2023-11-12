import { Parser } from "@bygdle/expr-parser"
import { Program } from "@src/cmd/command/Program"
import { Environment } from "./Environment"

test("run commands with expressions", () => {
    const env = create()

    const fn = env.compile(`
        const $name myvar
        set $name {1 + sqrt(5)/2}  
        get $name
    `)

    const r = fn()

    console.log(r)
})


function create() {
    const program = new Program<Map<string, number>, number>(new Map(), {
        "set": {
            name: "set",
            arguments: "name value",
            docs: {
                name: "The name of the variable",
                value: "The value of the variable"
            },
            description: "Sets a variable",
            compile({ values }, ctx) {
                const [name, strval] = values
                const value = Number(strval).valueOf()

                return () => {
                    ctx.set(name, value)
                    return value
                }
            }
        },
        "get": {
            name: "get",
            arguments: "name",
            description: "Gets a variable",
            compile({ values }, ctx) {
                const [name] = values
                return () => {
                    return ctx.get(name) || 0
                }
            }
        }
    })


    const parser = new Parser(Parser.Contexts("math"))

    return new Environment({ program, parser })
}