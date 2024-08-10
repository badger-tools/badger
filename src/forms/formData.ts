import { type Writable } from "../core";

export interface FormData<T> extends Writable<T> {
	isDirty: boolean;
	validate: () => boolean;
};
