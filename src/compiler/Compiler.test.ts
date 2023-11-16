import { Program } from "@src/cmd/command/Program"
import { Compiler } from "./Compiler"

test("compiler preprocessing", () => {

    const compiler = new Compiler(new Program(0, {}))
    const result = compiler.preprocess(`
    
        const $pi {22/7}

        const $radius 5

        const $area {$pi * $radius * $radius}

        instruction set circle \\
            area to {floor($area)} and \\
            double area to {floor($area * 2)} \\
        end
    
    `)

    expect(result.length).toBe(1)

    const instruction = result[0]
    const strval = instruction.values.join(" ")

    const expected = "instruction set circle area to 78 and double area to 157 end"

    expect(strval).toBe(expected)
})



const squares: { w: number, h: number }[] = []
const program = new Program<typeof squares, void | number | string>(squares, {
    "echo": {
        name: "echo",
        arguments: "[text...]",
        compile({ values }) {
            return () => {
                return values.join(" ")
            }
        },
    },
    "square": {
        name: "square",
        children: {
            "add": {
                name: "add",
                arguments: "[width=] [height=]",
                compile({ named }, { context }) {
                    const { width, height } = named
                    const w = Number(width).valueOf()
                    const h = Number(height).valueOf()

                    return () => {
                        context.push({ w, h })
                    }
                }
            },
            "perimeter": {
                name: "perimeter",
                arguments: "index",
                compile({ values }, { context }) {
                    const index = Number(values[0]).valueOf()

                    return () => {
                        const square = context[index]
                        return square.w * 2 + square.h * 2
                    }
                }
            },
        },
    },
    "expr": {
        name: "expr",
        arguments: "value expr",
        compile({ expressions }) {
            const expr = expressions[1]
            if (!expr) {
                throw new Error("no expression")
            }
            return () => {
                expr.context.setVar("x", 5)
                return expr.evaluate(expr.length - 1)
            }
        }
    },
    "expr2": {
        name: "expr2",
        arguments: "args... expr=",
        compile({ index, expressions }) {
            const expr = expressions[index.expr]
            if (!expr) {
                throw new Error("no expression")
            }
            return () => {
                expr.context.setVar("x", 5)
                return expr.evaluate(expr.length - 1)
            }
        }
    },
    "expr3": {
        name: "expr3",
        arguments: "value1 value2 x=",
        compile({ get }) {
            return () => {
                get.expression("x")?.context.setVar("y", 5)
                return get.number("x") + get.number(0) + get.number(1)
            }

        }
    }
})

test("compiling", () => {

    const compiler = new Compiler(program)


    const cmd = compiler.compileString(`
    
        const $pi {22/7}
        const $po 50

        square add width=5 height=7 // instruction 1
        square add width={ // instruction 2
            2+2
        } height={
            1 + $pi^2
        }

        square perimeter 0 # instruction 3
        square perimeter { 5/5 } /* instruction 4 */

        echo $pi
        echo $po
    `)



    console.log(`compiled string: "${cmd.String()}"`)

    const [, , a, b, c, d] = cmd()

    expect(a).toBeCloseTo(2 * 5 + 2 * 7)
    expect(b).toBeCloseTo(2 * 4 + 2 * (1 + (22 / 7) ** 2))
    expect(c).toEqual((22 / 7).toString())
    expect(d).toEqual("50")

    const cmd2 = compiler.compileString("const $x 1\r\n\recho $x")
    expect(cmd2()).toEqual(["1"])
})


test("compile with non-preprocessed expressions", () => {
    const compiler = new Compiler(program)

    const cmd = compiler.compileString(`
        expr2 expr={@1+x} 1 2 3
        expr {1.5} {@ 1.5 + x}
    `)

    const [u, v] = cmd()
    expect(u).toEqual(6)
    expect(v).toEqual(6.5)
})


test("compile and get numeric values", () => {

    const compiler = new Compiler(program)

    const cmd = compiler.compileString(`
        expr3 {@25/100} 150% x={@1 + y}
    `)

    const [x] = cmd()
    expect(x).toBeCloseTo(25 / 100 + 1.5 + 6)
})