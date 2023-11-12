export const EXPR_CONST_REPLACE = /\$([a-z_][a-z0-9_]*)/ig
export const EXPR_CONST_DEFINE = /^ *const +\$([a-z_][a-z0-9_]*) +(.*)$/img
export const EXPR_CONST_BRACKET = /(\{|\})/g

export const EXPR_INLINE_COMMENT = /(?:\/\/|#).*$/gm
export const EXPR_MULTILINE_COMMENT = /\/\*[\s\S]*?\*\//gm

/**
 * Matches a block expression, e.g. {1 + 1}
 */
export const EXPR_BLOCK_EXPRESSION = /\{([^}]*)\}/ig

/**
 * matches a block quote, e.g. "hello world"
 */
export const EXPR_BLOCK_QUOTE = /"([^"]*)"/ig

/**
 * named arguments with quotes, e.g. hello="world"
 */
export const EXPR_BLOCK_QUOTE_NAMED  = /(([a-z_][a-z0-9_]*)="[^"]*")/ig

/**
 * Matches a single part, anything without whitespaces
 */
export const EXPR_PART = /([^\s]+)/ig