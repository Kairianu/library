import * as string from '../../primitives/string.mjs';

import * as ipv4 from './ipv4.mjs';
import * as ipv6 from './ipv6.mjs';


// TODO: Make this function more thorough.
// TODO: Move to ipv6 library when more thorough.
export function isIPv6Address(value) {
	return String(value).includes(':');
}

export function getHostAddress(hostname, port) {
	hostname = string.toString(hostname) ?? '';
	port = string.toString(port) ?? '';

	if ( isIPv6Address(hostname) ) {
		hostname = '[' + hostname + ']';
	}

	let hostString = hostname;

	if ( port ) {
		hostString += ':' + port;
	}

	return hostString;
}

export function getRoutableAddress(value) {
	if ( isIPv6Address(value) ) {
		return ipv6.getRoutableAddress(value);
	}

	return ipv4.getRoutableAddress(value);
}
