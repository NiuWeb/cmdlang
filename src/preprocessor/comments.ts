/**
 * Removes all comments from the source code.
 */
export function RemoveComments(input: string): string {
    // first remove all single line comments
    input = input.replace(/(?:\/\/|#).*$/gm, "")

    // then remove all multiline comments, but keep the newlines
    input = input.replace(/\/\*[\s\S]*?\*\//gm, (match) => {
        return match.replace(/[^\n]/g, " ")
    })

    return input
}