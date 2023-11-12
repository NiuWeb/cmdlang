import { EXPR_INLINE_COMMENT, EXPR_MULTILINE_COMMENT } from "./expressions"

/**
 * Removes all comments from the source code.
 */
export function RemoveComments(input: string): string {
    // first remove all single line comments
    input = input.replace(EXPR_INLINE_COMMENT, "")

    // then remove all multiline comments, but keep the newlines
    input = input.replace(EXPR_MULTILINE_COMMENT, (match) => {
        return match.replace(/[^\n]/g, " ")
    })

    return input
}