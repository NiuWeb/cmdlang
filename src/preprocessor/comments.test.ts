import { RemoveComments } from "./comments"

test("remove single line comments", () => {
    const input = `
    // this is a comment
    # this is also a comment
    `
    const output = RemoveComments(input)
    expect(output.length).toBe(15)
})

test("remove multiline comments", () => {
    const input = `
    /* this is a comment
    that spans multiple lines */
    `
    const output = RemoveComments(input)
    expect(output.length).toBe(63)
})

test("keep whitespace", () => {
    const input = "hello/*A*/world" // 5 commented characters
    const output = RemoveComments(input)
    expect(output).toBe("hello     world") // becomes 5 spaces
})