export type ListenerFn<T> = (value: T) => void;

export type StoreOptions<T> = {
	shouldUpdate?: (a: T, b: T) => boolean;
};

export type Readable<T> = {
	value: T;
	subscribe: (fn: (value: T) => void) => () => void;
};

export type Writable<T> = Readable<T> & {
	// value?: T;
	set: (value: T) => void;
	// subscribe: (fn: (value: T) => void) => void;
	update: (fn: (value: T) => T) => void;
};

// Helper type to extract the generic type of the store
export type StoreType<S> = S extends Writable<infer T> | Readable<infer T>
	? T
	: never;
