import * as string from '../../primitives/string.mjs';


export const hostAddress = '::';
export const localhostAddress = '::1';

export const addressSeparator = ':';
export const compressionSeparator = '::';


export function getAddressArray(value) {
	const ipv6Address = string.toString(value)?.trim();

	if ( ! ipv6Address ) {
		return;
	}

	let addressArray;

	if ( ipv6Address.includes(compressionSeparator) ) {
		const compressionArray = ipv6Address.split(compressionSeparator);

		const leftArray = compressionArray[0].split(addressSeparator);
		const rightArray = compressionArray[1].split(addressSeparator);

		const compressedCount = 8 - (leftArray.length + rightArray.length);

		for ( let i = 0; i < compressedCount; i++ ) {
			leftArray.push('0000');
		}

		addressArray = leftArray.concat(rightArray);
	}
	else {
		addressArray = ipv6Address.split(addressSeparator);
	}

	for ( let i = 0; i < addressArray.length; i++ ) {
		addressArray[i] = addressArray[i].padStart(4, '0');
	}

	return addressArray;
}

export function getRoutableAddress(value) {
	if ( value == hostAddress ) {
		return localhostAddress;
	}

	return value;
}

/*
	TODO: Make an additional method that ensures an IPv6 address.
			- Check for multiple compression separators.
*/
export function isLikelyIPv6Address(value) {
	if ( string.isString(value) ) {
		if ( value.includes(addressSeparator) ) {
			return true;
		}
	}

	return false;
}
