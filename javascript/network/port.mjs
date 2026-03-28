import * as number from '../primitives/number.mjs';


export const dynamicPort = 0;
export const maxPort = 65535;
export const minPort = 0;


export function isValidPort(value) {
	if ( ! number.isNumber(value) ) {
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

export function validatePort(value, fallbackValue) {
	const port = number.parseInteger(value);

	if ( isValidPort(port) ) {
		return port;
	}

	const fallbackPort = number.parseInteger(fallbackValue);

	if ( isValidPort(fallbackPort) ) {
		return fallbackPort;
	}

	return dynamicPort;
}
