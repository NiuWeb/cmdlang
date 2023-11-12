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