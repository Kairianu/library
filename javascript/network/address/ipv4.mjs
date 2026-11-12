import * as string from '../../primitives/string.mjs';


export const hostAddress = '0.0.0.0';
export const localhostAddress = '127.0.0.1';

export const addressSeparator = '.';

export const octetRegExpString = '25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9]';

export const ipv4RegExpString = (
	`(?<octet1>${octetRegExpString})`
	+ `\\.(?<octet2>${octetRegExpString})`
	+ `\\.(?<octet3>${octetRegExpString})`
	+ `\\.(?<octet4>${octetRegExpString})`
);


const ipv4BoundedRegExp = getIPv4BoundedRegExp();


export function getAddressArray(value) {
	const ipv4Address = string.toString(value)?.trim();

	if ( ! ipv4Address ) {
		return;
	}

	const addressArray = ipv4Address.split(addressSeparator);

	for ( let i = 0; i < addressArray.length; i++ ) {
		addressArray[i] = parseInt(addressArray[i]);
	}

	return addressArray;
}

export function getIPv4BoundedRegExp() {
	return new RegExp('^' + ipv4RegExpString + '$');
}

export function getRoutableAddress(value) {
	if ( value == hostAddress ) {
		return localhostAddress;
	}

	return value;
}

// TODO: Make this a general method in another library for getting a valid value from an iterable.
export function getValidAddress(...values) {
	for ( const value of values ) {
		if ( isIPv4Address(value) ) {
			return value;
		}
	}

	return hostAddress;
}

export function isIPv4Address(value) {
	if ( string.isString(value) ) {
		if ( ipv4BoundedRegExp.test(value) ) {
			return true;
		}
	}

	return false;
}
