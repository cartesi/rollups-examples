export const genTimerPromise = (delay: number) => new Promise(
    resolve => window.setTimeout(resolve, delay)
)
