export interface CompiledFn<Value = void> {
    (): Value
}


export interface Compiled<Value> extends CompiledFn<Value> {
    /**
     * Gets the command string that was compiled
     */
    String(): string
}