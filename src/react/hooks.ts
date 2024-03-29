import { useEffect, useState } from "react";

import { Readable, Writable } from "../store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unset: any = Symbol();

export function useStore<T>(store: Readable<T> | Writable<T>): T {
	const [value, set] = useState<T>(unset as unknown as T);

	useEffect(() => store.subscribe(set), [store]);

	return value === unset ? store.value : value;
}
