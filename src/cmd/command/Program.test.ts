import { Program } from "./Program"

describe("find commands", () => {
    const prog = new Program<number, number | string>(0, {
        age: {
            name: "age",
            children: {
                old: {
                    name: "old",
                },
                young: {
                    name: "young",
                },
                "name with spaces": {
                    name: "name with spaces",
                    arguments: "name age",
                    compile({ values }) {
                        return () => values.join(" ")
                    }
                }
            }
        },
        size: {
            name: "size",
            children: {
                big: {
                    name: "big",
                    arguments: "index=",
                    compile({ named }) {
                        return () => parseInt(named["index"])
                    }
                },
                small: {
                    name: "small",
                }
            }
        },
    })

    test("won't find a command", () => {
        const [cmd] = prog.findCommand(["xyz"])
        expect(cmd).not.toBeDefined()
    })

    test("find a command in the root", () => {
        const [cmd, rem] = prog.findCommand(["age"])
        expect(cmd?.name).toBe("age")
        expect(rem).toEqual([])
    })

    test("find a command in the root with children", () => {
        const [cmd, rem] = prog.findCommand(["age", "old"])
        expect(cmd?.name).toBe("old")
        expect(rem).toEqual([])
    })

    test("find a command in the root with argument", () => {
        const [cmd, rem] = prog.findCommand(["age", "25"])
        expect(cmd?.name).toBe("age")
        expect(rem).toEqual(["25"])
    })

    test("find a command in the root with children and arguments", () => {
        const [cmd, rem] = prog.findCommand(["age", "old", "25", "12345"])
        expect(cmd?.name).toBe("old")
        expect(rem).toEqual(["25", "12345"])
    })

    test("compile with named argument", () => {
        const fn = prog.compile(["size", "big", "index=5"])
        expect(fn()).toBe(5)
    })

    test("compile with name with spaces", () => {
        const fn = prog.compile(["age", "name with spaces", "john", "25"])
        expect(fn()).toBe("john 25")
    })

    test("throws if not implemented", () => {
        expect(() => prog.compile(["size", "small"])).toThrow()
    })
})