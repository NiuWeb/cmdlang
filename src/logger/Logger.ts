import { Location } from "@bygdle/expr-parser"
import { sprintf } from "sprintf-js"

export interface Log {
    type: "log" | "warn" | "error"
    message: string
    line: number
}

export class Logger {
    public static Global = new Logger()

    private _log: Log[] = []
    private _line = 1

    public out = console.log

    private addLog(log: Log) {
        this._log.push(log)
        this.out(`[${log.type} at line ${log.line}] ${log.message}`)
    }

    public setLine(line: number | Location) {
        if (typeof line === "number") {
            this._line = line
        } else {
            this._line = line[0]
        }
    }

    public get line() {
        return this._line
    }

    public log(msg: string) {
        this.addLog({
            type: "log",
            message: msg,
            line: this._line
        })
    }

    public logf(msg: string, ...format: unknown[]) {
        this.log(sprintf(msg, ...format))
    }

    public warn(msg: string) {
        this.addLog({
            type: "warn",
            message: msg,
            line: this._line
        })
    }

    public warnf(msg: string, ...format: unknown[]) {
        this.warn(sprintf(msg, ...format))
    }

    public error(msg: string) {
        this.addLog({
            type: "error",
            message: msg,
            line: this._line
        })
    }

    public errorf(msg: string, ...format: unknown[]) {
        this.error(sprintf(msg, ...format))
    }
}