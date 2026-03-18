import * as type from '../type/type.mjs';


export function isNumber(value) {
	if ( typeof(value) == 'number' ) {
		return true;
	}

	if ( type.isInstance(value, Number) ) {
		return true;
	}

	return false;
}

export function isRealNumber(value) {
	if ( isNumber(value) ) {
		if ( isFinite(value) ) {
			return true;
		}
	}

	return false;
}
