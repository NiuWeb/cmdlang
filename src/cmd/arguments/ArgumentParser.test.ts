import { ArgumentParser } from "./ArgumentParser"

describe("template parsing", () => {
    test("parse positional argument list", () => {
        const list = new ArgumentParser("name age [gender] [email]")

        console.log(list.toString())

        expect(list.toString()).toEqual("name age [gender] [email]")
    })

    test("throws if optional argument not at the end", () => {
        expect(() => new ArgumentParser("name age [gender] [email] anotherdata")).toThrow()
    })

    test("won't throw if after optional argument are named arguments", () => {
        expect(() => new ArgumentParser("name age [gender] [email] anotherdata=")).not.toThrow()
    })

    test("named arguments are printed after positional arguments", () => {
        const list = new ArgumentParser("arg0=x arg1 arg2=y arg3 arg4=z")
        console.log(list.toString())
        expect(list.toString()).toEqual("arg1 arg3 arg0=x arg2=y arg4=z")
    })

    test("named arguments cannot have ... suffix", () => {
        expect(() => new ArgumentParser("arg0=x arg1 arg2=y arg3...=")).toThrow()
    })
    test("positional arguments can have ... suffix", () => {
        expect(() => new ArgumentParser("arg0=x arg1 arg2=y arg3...")).not.toThrow()
    })
    test("... argument can only be at the end", () => {
        expect(() => new ArgumentParser("arg0=x arg1 arg5... arg2=y arg3...")).toThrow()
    })

    test("correct min/max with positional arguments", () => {
        const list = new ArgumentParser("arg0 arg1 arg2 [arg3] [arg4]")
        expect(list.argMin).toEqual(3)
        expect(list.argMax).toEqual(5)
    })

    test("correct min/max with positional and named arguments", () => {
        const list = new ArgumentParser("arg0 arg1 named= arg2 [arg3] [arg4]")
        expect(list.argMin).toEqual(3)
        expect(list.argMax).toEqual(5)
    })

    test("correct min/max with positional, named and ... arguments", () => {
        const list = new ArgumentParser("arg0 arg1 named= arg2 rest...")
        expect(list.argMin).toEqual(3)
        expect(list.argMax).toEqual(Infinity)
    })
})

describe("argument parsing", () => {
    test("expected number of positional arguments", () => {
        const control = new ArgumentParser("name age [address] [email] [index=]")
        expect(() => control.parse("john")).toThrow()
        expect(() => control.parse("john 20")).not.toThrow()
        expect(() => control.parse("john 20 address")).not.toThrow()
        expect(() => control.parse("john 20 address email")).not.toThrow()
        expect(() => control.parse("john 20 address email 1")).toThrow()
    })

    test("expected named arguments", () => {
        const control = new ArgumentParser("name= age= [index=]")
        expect(() => control.parse("name=john")).toThrow()
        expect(() => control.parse("name=john age=20")).not.toThrow()
        expect(() => control.parse("age=20 name=john")).not.toThrow()
        expect(() => control.parse("age=20 name=john index=1")).not.toThrow()
    })

    test("unexpected named arguments", () => {
        const control = new ArgumentParser("name= age= [index=]")
        expect(() => control.parse("name=john age=20 index=1")).not.toThrow()
        expect(() => control.parse("name=john age=20 index=1 another=2")).toThrow()
    })

    test("any named argument", () => {
        const list = new ArgumentParser("arg0 arg1 [AnotherThing*=]")
        expect(() => list.parse("arg0 arg1")).not.toThrow()
        expect(() => list.parse("arg0 arg1 x=4 y=5")).not.toThrow()

        const val = list.parse("arg0 arg1 x=4 y=5")
        expect(val.named).toEqual({ x: "4", y: "5" })
    })

})