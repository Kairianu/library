import * as string from '../../primitives/string.mjs';


export const hostAddress = '0.0.0.0';
export const localhostAddress = '127.0.0.1';

export const octetRegExpString = '25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9]';

export const ipv4RegExpString = (
	`(?<octet1>${octetRegExpString})`
	+ `\\.(?<octet2>${octetRegExpString})`
	+ `\\.(?<octet3>${octetRegExpString})`
	+ `\\.(?<octet4>${octetRegExpString})`
);

export const ipv4FullRegExp = new RegExp('^' + ipv4RegExpString + '$');


export function getValidAddress(value, fallbackValue) {
	if ( isValidAddress(value) ) {
		return value;
	}

	if ( isValidAddress(fallbackValue) ) {
		return fallbackValue;
	}

	return hostAddress;
}

export function isValidAddress(value) {
	if ( string.isString(value) ) {
		if ( ipv4FullRegExp.test(value) ) {
			return true;
		}
	}

	return false;
}
