import type ErrorCode from "./errorCode";

export const hasErrorResult = <T>(result: T | unknown): result is Failure => {
	console.log(result);
	return (result as Failure).errorCode !== undefined;
};

export type Failure = {
	errorCode: ErrorCode;
	message: string;
};
