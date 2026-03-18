import * as number from '../number/number.mjs';
import * as type from '../type/type.mjs';


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

	if ( type.isInstance(value, String) ) {
		return true;
	}

	return false;
}

// TODO: Checking for a number should be done in number library. Checking for string and number should maybe be in type library.
export function shouldUseAsKey(value) {
	if ( isNonEmptyString(value) ) {
		return true;
	}

	if ( number.isRealNumber(value) ) {
		return true;
	}

	return false;
}
