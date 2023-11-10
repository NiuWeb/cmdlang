import { CmdSplit } from "./split"

describe("parts splitting", () => {
    test("words are split by spaces", () => {
        const list = CmdSplit("name age aaa...bbb")
        expect(list).toEqual(["name", "age", "aaa...bbb"])
    })
    test("arguments with quotes are also split", () => {
        const list = CmdSplit("arg0 arg1 \"all of this is the arg2\" arg3")
        expect(list).toEqual(["arg0", "arg1", "all of this is the arg2", "arg3"])
    })
})