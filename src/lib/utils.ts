export function delay(ms: number) {
    let rslv: () => void;
    const promise = new Promise<void>((rs, rj) => {
        rslv = rs;
    });
    setTimeout(() => {
        rslv();
    }, ms);
    return promise;
}
