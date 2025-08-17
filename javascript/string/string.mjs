export function isNonEmptyString(value) {
	if ( isString(value) ) {
		if ( value.length > 0 ) {
			return true;
		}
	}

	return false;
}

export function isString(value) {
	if ( typeof(value) == 'string' ) {
		return true;
	}

	if ( value instanceof String ) {
		return true;
	}

	return false;
}

export function shouldUseAsKey(value) {
	if ( isNonEmptyString(value) ) {
		return true;
	}

	if ( typeof(value) == 'number' || value instanceof Number ) {
		return true;
	}

	return false;
}
