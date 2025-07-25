export const dynamicPort = 0;
export const maxPort = 65535;
export const minPort = 0;


export function isValidPort(value) {
	if ( typeof(value) != 'number' ) {
		return false;
	}

	if ( ! Number.isInteger(value) ) {
		return false;
	}

	if ( value < minPort || value > maxPort ) {
		return false;
	}

	return true;
}

export function validatePort(value, defaultValue) {
	const port = parseInt(value);

	if ( isValidPort(port) ) {
		return port;
	}

	const defaultPort = parseInt(defaultValue);

	if ( isValidPort(defaultPort) ) {
		return defaultPort;
	}

	return dynamicPort;
}
