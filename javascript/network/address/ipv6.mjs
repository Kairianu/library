export const hostAddress = '::';
export const localhostAddress = '::1';


export function getRoutableAddress(value) {
	if ( value == hostAddress ) {
		return localhostAddress;
	}

	return value;
}
