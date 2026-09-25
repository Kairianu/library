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

	return false;
}

export function toString(value) {
	if ( value == undefined ) {
		return;
	}

	try {
		return String(value);
	} catch {}
}
