import type { Mutable } from "@repo/shared/types/mutation";
import { stop } from "#/constants";
import { requestMethods } from "#/constants/request";
import type { HttpInstance } from "#/types";
import type { Input, Options } from "#/types/option";
import { validateAndMerge } from "#/utils/merge";
import { retry } from "#/utils/retry";
import { Http } from "./instance";

export function createHttpInstance(defaults?: Partial<Options>): HttpInstance {
	const http: Partial<Mutable<HttpInstance>> = (input: Input, options?: Options) =>
		Http.create(input, validateAndMerge(defaults, options));

	for (const method of requestMethods) {
		http[method] = (input: Input, options?: Options) =>
			Http.create(input, validateAndMerge(defaults, options, { method }));
	}

	http.create = (newDefaults?: Partial<Options>) =>
		createHttpInstance(validateAndMerge(newDefaults));

	http.extend = (
		newDefaults?: Partial<Options> | ((parentDefaults: Partial<Options>) => Partial<Options>)
	) => {
		if (typeof newDefaults === "function") {
			newDefaults = newDefaults(defaults ?? {});
		}

		return createHttpInstance(validateAndMerge(defaults, newDefaults));
	};

	http.stop = stop;
	http.retry = retry;

	return http as HttpInstance;
}
