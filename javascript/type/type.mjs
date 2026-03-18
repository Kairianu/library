export function isInstance(value, constructor) {
	try {
		if ( value instanceof constructor ) {
			return true;
		}
	} catch {}

	return false;
}
