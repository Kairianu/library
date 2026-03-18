import * as functions from '../function/function.mjs';


export function convertToObject(value) {
	if ( isObject(value) ) {
		return value;
	}

	if ( value == undefined ) {
		return getNewObject();
	}

	return new Object(value);
}

export function getIterator(value, iterableMethod=Object.values) {
	if ( isIterable(value) ) {
		return value;
	}

	if ( value != undefined ) {
		if ( typeof(iterableMethod) == 'function' ) {
			return iterableMethod(value);
		}
	}

	return [];
}

export function getNewObject() {
	return {};
}

export function isAsyncIterable(value) {
	const asyncIterator = value?.[Symbol.asyncIterator];

	if ( typeof(asyncIterator) == 'function' ) {
		return true;
	}

	return false;
}

export function isIterable(value) {
	const iterator = value?.[Symbol.iterator];

	if ( typeof(iterator) == 'function' ) {
		return true;
	}

	return false;
}

export function isObject(value) {
	if ( value != null ) {
		if ( typeof(value) == 'object' ) {
			return true;
		}
	}

	return false;
}

export function shouldUseProperties(value) {
	if ( isObject(value) ) {
		return true;
	}

	if ( functions.isFunction(value) ) {
		return true;
	}

	return false;
}

export function validateIterable(value, loopAll) {
	try {
		if ( loopAll ) {
			for ( const _ of value ) {}
		}
		else {
			for ( const _ of value ) {
				break;
			}
		}

		return true;
	} catch {}

	return false;
}
