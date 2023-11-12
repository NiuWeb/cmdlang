import { Parser } from "./Parser"

describe("constant declarations validation", ( ) => {
    test("throws error if no name", () => {
        const parser = new Parser()
        expect(() => parser.parse("const")).toThrow()
    })

    test("throws error if no value", () => {
        const parser = new Parser()
        expect(() => parser.parse("const $x")).toThrow()
    })

    test("throws error if invalid name", () => {
        const parser = new Parser()
        expect(() => parser.parse("const $ 1")).toThrow()
        expect(() => parser.parse("const $1 1")).toThrow()
        expect(() => parser.parse("const name 1")).toThrow()
        expect(() => parser.parse("const const 1")).toThrow()
    })

    test("throws if any part is in a different line", () => {
        const parser = new Parser()
        expect(() => parser.parse(`
        const $x 
        1
        `)).toThrow()

        expect(() => parser.parse(`
        const 
        $x 1
        `)).toThrow()

        expect(() => parser.parse(`
        const 
        $x 
        1`)).toThrow()
    })

    test("correct declaration", () => {
        const parser = new Parser()
        expect(() => parser.parse("const $x 1")).not.toThrow()
    })
})

describe("instruction parsing", () => {
    test("parses single instruction", () => {
        const parser = new Parser()
        const tokens = parser.parse("do something here")

        expect(tokens.length).toBe(1)
        expect(tokens[0].type).toBe("instruction")
        expect(tokens[0].values.length).toBe(3)
    })

    test("parses multiple instructions", () => {
        const parser = new Parser()
        const tokens = parser.parse(`
            do something here
            and another thing here
        `)
        expect(tokens.length).toBe(2)
        expect(tokens[0].type).toBe("instruction")
        expect(tokens[0].values.length).toBe(3)
        expect(tokens[1].type).toBe("instruction")
        expect(tokens[1].values.length).toBe(4)
    })

    test("parses instructions with line breaks", () => {
        const parser = new Parser()
        const tokens = parser.parse(`
            do something here \\
            this is part of the same instruction
            and another thing here
        `)
        expect(tokens.length).toBe(2)
        expect(tokens[0].type).toBe("instruction")
        expect(tokens[0].values.length).toBe(10)
        expect(tokens[1].type).toBe("instruction")
        expect(tokens[1].values.length).toBe(4)
    })

    test("parses instructions with line breaks and quotes", () => {
        const parser = new Parser()
        const tokens = parser.parse(`
            do something here \\
            "this is part of the same instruction"
            and another thing here "with
            quotes" here
        `)
        expect(tokens.length).toBe(2)
        expect(tokens[0].type).toBe("instruction")
        expect(tokens[0].values.length).toBe(4)
        expect(tokens[1].type).toBe("instruction")
        expect(tokens[1].values.length).toBe(6)
    })
})

describe("expression parsing", () => {
    test("parses single expression", () => {
        const parser = new Parser()
        const tokens = parser.parse("do {something} here")

        expect(tokens.length).toBe(1)
        expect(tokens[0].type).toBe("instruction")
        expect(tokens[0].values.length).toBe(3)

        const expr = tokens[0].values[1]
        expect(expr.type).toBe("expression")
        expect(expr.value).toBe("something")
    })

    
    test("parses multiline expression", () => {
        const parser = new Parser()
        const tokens = parser.parse(`
            do {
                something in
                several lines
            } here
        `)

        expect(tokens.length).toBe(1)
        expect(tokens[0].type).toBe("instruction")
        expect(tokens[0].values.length).toBe(3)

        const expr = tokens[0].values[1]
        expect(expr.type).toBe("expression")
        expect(expr.value.trim()).toBe(`
                something in
                several lines`.trim())
    })
})