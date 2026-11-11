export function isNonEmptyString(value) {
	if ( isString(value) ) {
		if ( value.length > 0 ) {
			return true;
		}
	}

	return false;
}

export function isString(value) {
	return typeof(value) == 'string';
}

export function toString(value) {
	if ( value != undefined ) {
		try {
			return String(value);
		} catch {}
	}
}
