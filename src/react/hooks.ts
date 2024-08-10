import { useEffect, useState } from "react";

import { Readable, Writable } from "../core";

export function useStore<T>(store: Readable<T> | Writable<T>): T {
	const [value, set] = useState<T>(store.value);

	useEffect(() => store.subscribe(set), [store]);

	return value;
}
