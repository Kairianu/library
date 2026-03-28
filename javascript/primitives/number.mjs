export function isNumber(value) {
	if ( typeof(value) == 'number' ) {
		return true;
	}

	return false;
}

export function isRealNumber(value) {
	if ( isNumber(value) ) {
		if ( Number.isFinite(value) ) {
			return true;
		}
	}

	return false;
}
