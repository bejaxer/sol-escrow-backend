import fs from 'fs'

export function write(path: string, data): void {
    fs.writeFileSync(path, data)
}

export function loadJson(path: string): any {
    return JSON.parse(fs.readFileSync(path).toString())
}