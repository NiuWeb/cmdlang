import { Token } from "./Token"
import { EXPR_CONST } from "./expressions"

/**
 * Takes the three tokens for a constant definition and validates them.
 * Throws an error if the tokens are invalid.
 * @param token Token for the "const"
 * @param nameToken Token for the constant name
 * @param valueToken Token for the constant value
 */
export function validateConstantTokens(token: Token, nameToken: Token, valueToken: Token) {
    if (!nameToken) {
        throw new Error(`expected constant name after "const" at ${token.start}`)
    }

    if (!nameToken.value.match(EXPR_CONST)) {
        throw new Error(`constant name must be a valid identifier at ${nameToken.start}`)
    }

    if (nameToken.value === "const") {
        throw new Error(`constant name cannot be "const" at ${nameToken.start}`)
    }

    if (nameToken.type !== "part") {
        throw new Error(`constant name cannot be an expression at ${nameToken.start}`)
    }

    if (!valueToken) {
        throw new Error(`expected constant value after constant name at ${nameToken.end}`)
    }

    if (nameToken.start[0] !== token.start[0]) {
        throw new Error(`constant name must be on the same line as "const" at ${nameToken.start}`)
    }

    if (valueToken.start[0] !== nameToken.start[0]) {
        throw new Error(`constant value must be on the same line as constant name at ${valueToken.start}`)
    }
}