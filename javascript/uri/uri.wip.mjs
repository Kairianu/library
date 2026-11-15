// NOTICE: This script is not fully functioning.


/* domain
	If empty you know its a url?
*/

/* path
	For file urls path must be made absolute.
	If uri is not a url then query and fragment should be part of path.
*/



import * as networkAddress from '../network/address/address.mjs';
import * as string from '../primitives/string.mjs';


function executeStickyRegularExpression(regularExpression, parseData) {
	regularExpression.lastIndex = parseData.lastIndex;

	const regularExpressionMatch = regularExpression.exec(parseData.value);

	if ( regularExpressionMatch ) {
		parseData.lastIndex = regularExpression.lastIndex;
	}

	return regularExpressionMatch;
}

function getNewParseData(value) {
	return {
		lastIndex: 0,
		value: value,
	};
}



export class Authority {
	#host;
	#password;
	#port;
	#username;


	// TODO: Should host and port check for trailing slash?
	regularExpressions = {
		host: /(?<host>[^:/]*)/y,
		port: /:(?<port>[^/]*)/y,
		userinfo: /(?<username>[^:]*)(:(?<password>.*))?@/y,
	};


	get host() {
		return this.#host;
	}

	set host(value) {
		let host;

		if ( value != undefined ) {
			host = new Host(value);
		}

		this.#host = host;
	}

	get password() {
		return this.#password;
	}

	set password(value) {
		this.#password = string.toString(value);
	}

	get port() {
		return this.#port;
	}

	set port(value) {
		let port;

		if ( value != undefined ) {
			port = new Port(value);
		}

		this.#port = port;
	}

	get username() {
		return this.#username;
	}

	set username(value) {
		this.#username = string.toString(value);
	}


	get authorityString() {
		let authorityString = '';

		const userinfoString = this.userinfoString;

		if ( userinfoString ) {
			authorityString += userinfoString + '@';
		}

		const host = this.host;

		if ( host ) {
			authorityString += host;
		}

		const port = this.port;

		if ( port ) {
			authorityString += ':' + port;
		}

		return authorityString;
	}

	get userinfoString() {
		let userinfoString = '';

		const username = this.username;

		if ( username ) {
			userinfoString += username;
		}

		const password = this.password;

		if ( password ) {
			userinfoString += ':' + password;
		}

		return userinfoString;
	}


	parseString(value) {
		const authorityString = string.toString(value);

		if ( ! authorityString ) {
			return;
		}

		const parseData = getNewParseData(authorityString);

		const userinfoMatch = executeStickyRegularExpression(this.regularExpressions.userinfo, parseData);

		this.password = userinfoMatch?.groups.password;
		this.username = userinfoMatch?.groups.username;

		const hostMatch = executeStickyRegularExpression(this.regularExpressions.host, parseData);

		this.host = hostMatch?.groups.host;

		const portMatch = executeStickyRegularExpression(this.regularExpressions.port, parseData);

		this.port = portMatch?.groups.port;
	}

	toString() {
		return this.authorityString;
	}


	constructor(value) {
		this.parseString(value);
	}
}









export class Host {
	#hostname;
	#port;


	regularExpressions = {
		bracket: /\[(?<hostname>.*)\]/y,
		host: /(?<hostname>[^:]*)(:(?<port>.*))?/,
		port: /:(?<port>.*)/y,
	};


	get hostname() {
		return this.#hostname;
	}

	set hostname(value) {
		let hostname;

		if ( value != undefined ) {
			hostname = new Hostname(value);
		}

		this.#hostname = hostname;
	}

	get port() {
		return this.#port;
	}

	set port(value) {
		let port;

		if ( value != undefined ) {
			port = new Port(value);
		}

		this.#port = port;
	}


	parseString(value) {
		const hostString = string.toString(value)?.trim();

		if ( ! hostString ) {
			return;
		}

		const parseData = getNewParseData(hostString);

		const bracketMatch = executeStickyRegularExpression(this.regularExpressions.ipv6, parseData);

		if ( bracketMatch ) {
			this.hostname = bracketMatch.groups.hostname;

			const portMatch = executeStickyRegularExpression(this.regularExpressions.port, parseData);

			this.port = portMatch?.groups.port;
		}
		else {
			const hostMatch = this.regularExpressions.host.exec(hostString);

			this.hostname = hostMatch?.groups.hostname;
			this.port = hostMatch?.groups.port;
		}
	}


	constructor(value) {
		this.parseString(value);
	}
}




export class Hostname {
	#hostnameString;
	#isIPv4Address = false;
	#isIPv6Address = false;


	get hostnameArray() {
		const hostnameString = this.hostnameString;

		if ( ! hostnameString ) {
			return;
		}

		if ( this.isIPv4Address ) {
			return networkAddress.ipv4.getAddressArray(hostnameString);
		}
		else if ( this.isIPv6Address ) {
			return networkAddress.ipv6.getAddressArray(hostnameString);
		}

		return hostnameString.split('.');
	}

	get hostnameString() {
		return this.#hostnameString;
	}

	get isDomain() {
		return !(this.isIPv4Address || this.isIPv6Address);
	}

	get isIPv4Address() {
		return this.#isIPv4Address;
	}

	get isIPv6Address() {
		return this.#isIPv6Address;
	}


	parseString(value) {
		const hostnameString = string.toString(value)?.trim();

		if ( hostnameString ) {
			if ( networkAddress.ipv4.isIPv4Address(hostnameString) ) {
				this.#isIPv4Address = true;
			}
			else if ( networkAddress.ipv6.isLikelyIPv6Address(hostnameString) ) {
				this.#isIPv6Address = true;
			}
		}

		this.#hostnameString = hostnameString;
	}

	toString() {
		return this.hostnameString ?? '';
	}


	constructor(value) {
		this.parseString(value);
	}
}



// TODO: This should maybe use the network port library.
export class Port {}






// TODO: Handle empty domains and tld only.
// export class Host {
// 	regularExpressions = {
// 		hostParts: /(?<domainPart>[^.]+)/g,
// 	};


// 	get fullDomain() {
// 		return (
// 			this.subdomainString
// 			+ '.' + this.secondLevelDomain
// 			+ '.' + this.topLevelDomain
// 		);
// 	}

// 	get subdomainString() {
// 		return this.subdomainArray.join('.');
// 	}


// 	parseString(hostString) {
// 		const domainArray = [];

// 		const domainPartsRegExp = this.regExps.domainParts;

// 		while ( true ) {
// 			const domainPartsMatch = domainPartsRegExp.exec(domainString);

// 			if ( ! domainPartsMatch ) {
// 				break;
// 			}

// 			domainArray.push(domainPartsMatch.groups.domainPart);
// 		}

// 		this.topLevelDomain = domainArray.pop();

// 		this.secondLevelDomain = domainArray.pop();

// 		this.subdomainArray = domainArray;
// 	}
// }




export class Query {
	regExpStrings = {
		queryKeyValue: '(?<key>[^=]*)(=(?<value>.*))?',
		queryPairs: '(?<queryPair>[^&]+)',
	};

	regExps = {
		queryKeyValue: new RegExp(this.regExpStrings.queryKeyValue),
		queryPairs: new RegExp(this.regExpStrings.queryPairs, 'g'),
	};

	values = {};


	constructor(queryString) {
		this.parseString(queryString);
	}


	getValue(key) {
		return this.values[key];
	}

	parseString(queryString) {
		const regExps = this.regExps;

		const queryKeyValueRegExp = regExps.queryKeyValue;
		const queryPairsRegExp = regExps.queryPairs;

		while ( true ) {
			const queryPairsMatch = queryPairsRegExp.exec(queryString);

			if ( ! queryPairsMatch ) {
				break;
			}

			const queryKeyValueMatch = queryKeyValueRegExp.exec(queryPairsMatch.groups.queryPair);

			if ( queryKeyValueMatch ) {
				const key = queryKeyValueMatch.groups.key;
				const value = queryKeyValueMatch.groups.value ?? true;

				this.values[key] = value;
			}
		}
	}
}





export class Path {}









export class URI {
	#authority;
	#fragment;
	#path;
	#query;
	#scheme;


	regularExpressions = {
		authority: /\/\/(?<authority>[^/?#]*)/y,
		fragment: /#(?<fragment>.*)/y,
		path: /(?<path>[^?#]*)/y,
		query: /\?(?<query>[^#]*)/y,
		scheme: /\s*(?<scheme>[^:/]*):/y,
	};


	get authority() {
		return this.#authority;
	}

	set authority(value) {
		let authority;

		if ( value != undefined ) {
			authority = new Authority(value);
		}

		this.#authority = authority;
	}


	get fragment() {
		return this.#fragment;
	}

	set fragment(value) {
		this.#fragment = string.toString(value);
	}


	get path() {
		return this.#path;
	}

	set path(value) {
		let path;

		if ( value != undefined ) {
			path = new Path(value);
		}

		this.#path = path;
	}


	get query() {
		return this.#query;
	}

	set query(value) {
		let query;

		if ( value != undefined ) {
			query = new Query(value);
		}

		this.#query = query;
	}


	get scheme() {
		return this.#scheme;
	}

	set scheme(value) {
		this.#scheme = string.toString(value);
	}


	// TODO: Check this.
	get isURL() {
		if ( this.authority?.domain.fullDomain == undefined ) {
			return false;
		}

		return true;
	}


	parseString(value) {
		const uriString = string.toString(value);

		if ( ! uriString ) {
			return;
		}

		const parseData = getNewParseData(uriString);

		const schemeMatch = executeStickyRegularExpression(this.regularExpressions.scheme, parseData);

		this.scheme = schemeMatch?.groups.scheme;

		const authorityMatch = executeStickyRegularExpression(this.regularExpressions.authority, parseData);

		this.authority = authorityMatch?.groups.authority;

		const pathMatch = executeStickyRegularExpression(this.regularExpressions.path, parseData);

		this.path = pathMatch?.groups.path;

		const queryMatch = executeStickyRegularExpression(this.regularExpressions.query, parseData);

		this.query = queryMatch?.groups.query;

		const fragmentMatch = executeStickyRegularExpression(this.regularExpressions.fragment, parseData);

		this.fragment = fragmentMatch?.groups.fragment;
	}


	// TODO: Fix.
	toString() {
		let uriString = '';

		const scheme = this.scheme;

		if ( scheme ) {
			uriString += scheme + ':';
		}

		const domain = uriInfo.domain;

		if ( domain != undefined ) {
			uriString += '//';

			const username = uriInfo.username;

			if ( username != undefined ) {
				uriString += username;
			}

			const password = uriInfo.password;

			if ( password != undefined ) {
				uriString += ':' + password;
			}

			if ( username != undefined || password != undefined ) {
				uriString += '@';
			}

			uriString += domain;

			const port = uriInfo.port;

			if ( port != undefined ) {
				uriString += ':' + port;
			}
		}

		const path = uriInfo.path;

		if ( path != undefined ) {
			uriString += path;
		}

		const query = uriInfo.query;

		if ( query != undefined ) {
			uriString += '?' + query;
		}

		const fragment = uriInfo.fragment;

		if ( fragment != undefined ) {
			uriString += '#' + fragment;
		}

		return uriString;
	}


	constructor(value) {
		this.parseString(value);
	}
}











const testStrings = [
	'scheme://username:password@sub.domain.tld:port/path/to?query&key=value#fragment',
];

for ( const testString of testStrings ) {
	// const uri = new URI(testString)
}




const h = new Hostname('qwe');

console.log(h);
