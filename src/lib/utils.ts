export function delay(timeout?: number) {
    return new Promise<void>((rs) => setTimeout(() => rs(), timeout));
}
