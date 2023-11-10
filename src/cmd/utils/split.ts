/**
 * Splits a single string into an array of parts
 * for a command instruction. Those parts can be
 * command names or arguments.
 */
export function CmdSplit(str: string): string[] {
    const expr = /"[^"]+"|[^\s]+/g
    const parts = str.matchAll(expr)
    return Array.from(parts)
    .map(part => {
        const value = part[0]
        if(value.startsWith("\"") && value.endsWith("\"")) {
            return value.slice(1, -1)
        }
        return value  
    })
}