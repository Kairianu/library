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

export function parseInteger(value, radix) {
	if ( radix != undefined ) {
		try {
			radix = parseInt(radix);
		}
		catch {
			radix = undefined;
		}
	}

	try {
		return parseInt(value, radix);
	} catch {}

	return NaN;
}

export function parseNumber(value, radix) {
	if ( radix != undefined ) {
		return parseInteger(value, radix);
	}

	try {
		return parseFloat(value);
	} catch {}

	return NaN;
}
