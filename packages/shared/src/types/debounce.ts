import type { Result } from "./result";

export type DebounceOptions = {
	/** Call on the leading edge of the wait interval */
	leading: boolean;
	/** Call on the trailing edge of the wait interval (default: true) */
	trailing: boolean;
	/** Maximum wait time before forcing an invocation */
	maxWait: number;
};
