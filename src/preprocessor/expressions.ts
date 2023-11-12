export const EXPR_CONST_REPLACE = /\$([a-z_][a-z0-9_]*)/ig
export const EXPR_CONST_DEFINE = /^ *const +\$([a-z_][a-z0-9_]*) +(.*)$/img
export const EXPR_CONST_BRACKET = /(\{|\})/g

export const EXPR_INLINE_COMMENT = /(?:\/\/|#).*$/gm
export const EXPR_MULTILINE_COMMENT = /\/\*[\s\S]*?\*\//gm