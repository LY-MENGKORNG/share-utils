import { httpOptionKey, vendorSpecificOptions } from "#/constants";
import { requestOptionsRegistry } from "#/constants/request";
import type { SearchParamsOption } from "#/types/option";

export const findUnknownOptions = (
	request: Request,
	options: Record<string, unknown>
): Record<string, unknown> => {
	const unknownOptions: Record<string, unknown> = {};

	for (const key in options) {
		// Skip inherited properties
		if (!Object.hasOwn(options, key)) {
			continue;
		}

		// An option is passed to fetch() if:
		// 1. It's not a standard RequestInit option (not in requestOptionsRegistry)
		// 2. It's not a http-specific option (not in httpOptionKeys)
		// 3. Either:
		//    a. It's not on the Request object, OR
		//    b. It's a vendor-specific option that should always be passed (in vendorSpecificOptions)
		if (
			!(key in requestOptionsRegistry) &&
			!(key in httpOptionKey) &&
			(!(key in request) || key in vendorSpecificOptions)
		) {
			unknownOptions[key] = options[key];
		}
	}

	return unknownOptions;
};

export const hasSearchParameters = (search: SearchParamsOption): boolean => {
	if (search === undefined) {
		return false;
	}

	// The `typeof array` still gives "object", so we need different checking for array.
	if (Array.isArray(search)) {
		return search.length > 0;
	}

	if (search instanceof URLSearchParams) {
		return search.size > 0;
	}

	// Record
	if (typeof search === "object") {
		return Object.keys(search).length > 0;
	}

	if (typeof search === "string") {
		return search.trim().length > 0;
	}

	return Boolean(search);
};
