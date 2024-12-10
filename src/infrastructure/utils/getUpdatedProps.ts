/**
 * Get updated props from an object
 * will return only the props that are not undefined, null or empty string
 * @param obj
 */
export function getUpdatedProps<T extends { [s: string]: unknown }>(
	obj: T,
): Partial<T> {
	return Object.fromEntries(
		Object.entries(obj).filter(
			([_, value]) => value !== undefined && value !== null && value !== "",
		),
	) as Partial<T>;
}
