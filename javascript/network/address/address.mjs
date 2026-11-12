import * as string from '../../primitives/string.mjs';

import * as ipv4 from './ipv4.mjs';
import * as ipv6 from './ipv6.mjs';

export * as ipv4 from './ipv4.mjs';
export * as ipv6 from './ipv6.mjs';


export function getHostAddress(hostname, port) {
	hostname = string.toString(hostname)?.trim();
	port = string.toString(port)?.trim();

	if ( ipv6.isLikelyIPv6Address(hostname) ) {
		hostname = '[' + hostname + ']';
	}

	let hostString = hostname ?? '';

	if ( port ) {
		hostString += ':' + port;
	}

	return hostString;
}

/*
	Looks like it will return an IPv6 address but will return a IPv4 or IPv6
	address due to how getRoutableAddress methods currently work by returning
	the localhostAddress if it matches the hostAddress.
	This may have to be changed.
*/
export function getRoutableAddress(value) {
	return ipv6.getRoutableAddress(ipv4.getRoutableAddress(value));
}
