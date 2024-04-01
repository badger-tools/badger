import { Storage, StorageEngine, isStorageEngine } from "./types";

export const buildStorage = <T>(storage?: Storage<T>): StorageEngine<T> | undefined => {
	if (!storage) return;
	if (isStorageEngine<T>(storage)) return storage;

	const store = window[storage.engine];
	if (!store) return;

	return {
		key: storage.key,
		getItem: (key): T | null => {
			const item = store?.getItem(key);
			if (item) {
				try {
					return (typeof item === 'string' ? JSON.parse(item) : item) as T;
				} catch (e) {
					return null;
				}
			}
			return null;
		},
		setItem: (key: string, value: T) => {
			store?.setItem(key, JSON.stringify(value));
		},
		removeItem: (key: string) => {
			store?.removeItem(key);
		},
	};
};
