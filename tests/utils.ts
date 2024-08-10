import { Writable } from "../src/core/types";

/**
 * Helper function to wait for the next value of an atom that satisfies
 * a condition.
 * */
export const awaitNext = <T>(
	store: Writable<T>,
	condition?: (value: T) => boolean,
) =>
	new Promise<void>((resolve) => {
		const unsubscribe = store.subscribe((value) => {
			if (!condition || condition(value)) {
				resolve();
				unsubscribe(); // Clean up subscription after condition is met
			}
		});
	});
