export const hostAddress = '0.0.0.0';
export const localhostAddress = '127.0.0.1';


export function isValidAddress(value) {
	if ( typeof(value) != 'string' ) {
		return false;
	}

	const addressArray = value.split('.');

	if ( addressArray.length != 4 ) {
		return false;
	}

	for ( const octetString of addressArray ) {
		if ( /[^\d]/.exec(octetString) ) {
			return false;
		}

		const octet = parseInt(octetString);

		if ( ! Number.isInteger(octet) ) {
			return false;
		}

		if ( octet < 0 || octet > 255 ) {
			return false;
		}
	}

	return true;
}

export function validateAddress(value, defaultValue) {
	if ( isValidAddress(value) ) {
		return value;
	}

	if ( isValidAddress(defaultValue) ) {
		return defaultValue;
	}

	return hostAddress;
}
