export type ListenerFn<T> = (value: T) => void;

export type StorageEngine<T> = {
	key: string;
	getItem: (key: string) => T | null;
	setItem: (key: string, value: T) => void;
	removeItem: (key: string) => void;
};

export const isStorageEngine = <T>(storage: unknown): storage is StorageEngine<T> => {
	return (
		!!storage &&
		typeof storage === 'object' &&
		typeof (storage as StorageEngine<T>).getItem === 'function' &&
		typeof (storage as StorageEngine<T>).setItem === 'function' &&
		typeof (storage as StorageEngine<T>).removeItem === 'function'
	);
};

export type Storage<T> = {
	engine: 'localStorage' | 'sessionStorage';
	key: string;
} | StorageEngine<T>;

export type StoreOptions<T> = {
	shouldUpdate?: (a: T, b: T) => boolean;
	storage?: Storage<T>;
};

export type WritableOptions<T> = {
	shouldUpdate?: (curr: T, next: T) => boolean;
	storage?: StorageEngine<T>;
};

export interface Readable<T> {
	value: T;
	subscribe: (fn: (value: T) => void) => () => void;
};

export interface Writable<T> extends Readable<T> {
	// value?: T;
	set: (value: T) => void;
	// subscribe: (fn: (value: T) => void) => void;
	update: (fn: (value: T) => T) => void;
};

// Helper type to extract the generic type of the store
export type StoreType<S> = S extends Writable<infer T> | Readable<infer T>
	? T
	: never;
