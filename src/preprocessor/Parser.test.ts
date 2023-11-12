import { Parser as ExprParser } from "@bygdle/expr-parser"
import { Parser } from "./Parser"


describe("Preprocessing parser", () => {

    const create = () => new Parser(new ExprParser(ExprParser.Contexts("math")))

    test("can define constants", () => {
        const parser = create()
        parser.parse(`
        const $x 150%
        do another thing here
        const $y 50
        do something here
        `)

        expect(parser.getConstant("x")).toBe("150%")
        expect(parser.getConstant("y")).toBe("50")
    })

    test("can define constants with expressions", () => {
        const parser = create()
        parser.parse(`
        const $x 150%
        do another thing here
        const $y 50
        do something here
        const $z {1 + 1}
        `)

        expect(parser.getConstant("x")).toBe("150%")
        expect(parser.getConstant("y")).toBe("50")
        expect(parser.getConstant("z")).toBe("2")
    })

    test("can reference constants inside later expressions", () => {
        const parser = create()
        parser.parse(`
        const $x 150%
        do another thing here
        const $y 50
        do something here
        const $z {1 + 1}
        const $w {$z + 1}
        `)

        expect(parser.getConstant("x")).toBe("150%")
        expect(parser.getConstant("y")).toBe("50")
        expect(parser.getConstant("z")).toBe("2")
        expect(parser.getConstant("w")).toBe("3")
    })

    test("multiline expressions", () => {
        const parser = create()
        parser.parse(`
        const $x 150%
        do another thing here
        const $y 50
        do something here
        const $z {
            2 - 3,
            1 + 1
        }
        const $w {
            5*4,
            $z + 1
        }
        `)

        expect(parser.getConstant("x")).toBe("150%")
        expect(parser.getConstant("y")).toBe("50")
        expect(parser.getConstant("z")).toBe("2")
        expect(parser.getConstant("w")).toBe("3")
    })

    test("cannot redefine constants inside the code block", () => {
        const parser = create()
        expect(() => parser.parse(`
        const $x 150%
        do another thing here
        const $y 50
        do something here
        const $x 1
        `)).toThrow()
    })

    test("preprocessed text has the same number of lines as the original", () => {
        const parser = create()
        parser.parse(`
    
        const $x 150%
        do something here
        const $y 50
    
        {1 + 1} + 1
    
        const $cat {1 - sqrt($x)}
    
    
        const $dog {
            1 + $cat/2
        }
        another {    1    } thing {$dog - 1} in here
    
        `)

        const output = parser.preprocess()
        const lines = output.split("\n")
        expect(lines.length).toBe(17)

    })

    test("complete example", () => {
        const parser = create()
        parser.parse(`
    
        const $x 150%
        do something here
        const $y 50
    
        {1 + 1} + 1
    
        const $cat {1 - sqrt($x)}
    
    
        const $dog {
            1 + $cat/2
        }
        another {    1    } thing {$dog - 1} in here
    
        `)

        expect(parser.getConstant("x")).toBe("150%")
        expect(parser.getConstant("y")).toBe("50")
        expect(parseFloat(parser.getConstant("cat")!)).toBeCloseTo(1 - Math.sqrt(1.5))
        expect(parseFloat(parser.getConstant("dog")!)).toBeCloseTo(1 + (1 - Math.sqrt(1.5))/2)
        console.log("'" + parser.preprocess() + "'")
    })
    

    test("another example", () => {
        const parser = create()
        parser.parse(`
        const $name myvar
        set $name {1 + sqrt(5)/2}  
        get $name
    `)
        console.log(parser.getTokens())
        console.log("'" + parser.preprocess() + "'")
    })
})