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


test("compiling", () => {
    const squares: { w: number, h: number }[] = []

    const program = new Program(squares, {
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
                }
            }
        }
    })

    const compiler = new Compiler(program)


    const cmd = compiler.compileString(`
    
        const $pi {22/7}

        square add width=5 height=7 // instruction 1
        square add width={ // instruction 2
            2+2
        } height={
            1 + $pi^2
        }

        square perimeter 0 # instruction 3
        square perimeter { 5/5 } /* instruction 4 */

    `)

    const [, , a, b] = cmd()

    expect(a).toBeCloseTo(2 * 5 + 2 * 7)
    expect(b).toBeCloseTo(2 * 4 + 2 * (1 + (22 / 7) ** 2))
})