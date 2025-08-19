import * as functions from '../function/function.mjs';


export function isObject(value) {
	if ( value == null ) {
		return false;
	}

	return typeof(value) == 'object';
}

export function shouldUseProperties(value) {
	return isObject(value) || functions.isFunction(value);
}
