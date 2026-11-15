export function isNumber(value) {
	return typeof(value) == 'number';
}

export function parseInteger(value, radix) {
	if ( typeof(radix) == 'bigint' ) {
		radix = parseInt(radix);
	}

	try {
		return parseInt(value, radix);
	} catch {}

	return NaN;
}

export function parseNumber(value) {
	try {
		return parseFloat(value);
	} catch {}

	return NaN;
}
