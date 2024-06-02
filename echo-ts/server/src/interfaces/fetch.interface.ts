export interface FetchInterface<T> {
    headers: {[key: string]: string},
    ok: boolean,
    url: string,
    status: number,
    type: 'json',
    text(): string,
    json(): T,
}
