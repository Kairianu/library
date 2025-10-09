export function getCurrentTarget(value) {
	if ( value instanceof Event ) {
		return value.currentTarget;
	}

	return value;
}
