export function isFunction(value) {
	if ( typeof(value) == 'function' ) {
		return true;
	}

	return false;
}

export function settle(value, ...args) {
	if ( typeof(value) == 'function' ) {
		return value(...args);
	}

	return value;
}
