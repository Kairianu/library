// NOTICE: This script is not fully functioning.


/* domain
	If empty you know its a url?
*/

/* path
	For file urls path must be made absolute.
	If uri is not a url then query and fragment should be part of path.
*/

// TODO: Combine regExps into one object.
// TODO: Export regExp strings?




export class Authority {
	regExpStrings = {
		domain: '(?<domain>[^:/]*)',
		port: ':(?<port>[^/]*)',

		// TODO: Check userinfoRegExp.
		// userinfoRegExp = /(?<username>[^:]*)(:(?<password>.*))?@/y;
		userinfo: '(?<userinfo>[^:]*(:.*)?)@',
	};

	regExps = {
		domain: new RegExp(this.regExpStrings.domain, 'y'),
		port: new RegExp(this.regExpStrings.port, 'y'),
		userinfo: new RegExp(this.regExpStrings.userinfo, 'y'),
	};


	parseString(authorityString) {
		const regExps = this.regExps;

		const domainRegExp = regExps.domain;
		const portRegExp = regExps.port;
		const userinfoRegExp = regExps.userinfo;

		let lastIndex = 0;

		userinfoRegExp.lastIndex = lastIndex;

		const userinfoMatch = userinfoRegExp.exec(authorityString);

		if ( userinfoMatch ) {
			this.userinfo = new Userinfo(userinfoMatch.groups.userinfo);

			lastIndex = userinfoRegExp.lastIndex;
		}

		domainRegExp.lastIndex = lastIndex;

		const domainMatch = domainRegExp.exec(authorityString);

		if ( domainMatch ) {
			this.domain = new Domain(domainMatch.groups.domain);

			lastIndex = domainRegExp.lastIndex;
		}

		portRegExp.lastIndex = lastIndex;

		const portMatch = portRegExp.exec(authorityString);

		if ( portMatch ) {
			this.port = new Port(portMatch.groups.port);

			lastIndex = portRegExp.lastIndex;
		}
	}
}



// TODO: Handle empty domains and tld only.
export class Domain {
	regExpStrings = {
		domainParts: '(?<domainPart>[^.]+)',
	};

	regExps = {
		domainParts: new RegExp(this.regExpStrings.domainParts, 'g'),
	};


	get fullDomain() {
		return (
			this.subdomainString
			+ '.' + this.secondLevelDomain
			+ '.' + this.topLevelDomain
		);
	}

	get subdomainString() {
		return this.subdomainArray.join('.');
	}


	constructor(domainString) {
		this.parseString(domainString);
	}


	parseString(domainString) {
		const domainArray = [];

		const domainPartsRegExp = this.regExps.domainParts;

		while ( true ) {
			const domainPartsMatch = domainPartsRegExp.exec(domainString);

			if ( ! domainPartsMatch ) {
				break;
			}

			domainArray.push(domainPartsMatch.groups.domainPart);
		}

		this.topLevelDomain = domainArray.pop();

		this.secondLevelDomain = domainArray.pop();

		this.subdomainArray = domainArray;
	}

	toString() {
		return this.fullDomain;
	}
}




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




// TODO: This should maybe use the Port library from network.
export class Port {}



export class Userinfo {}



export class Scheme {}




console.log(new RegExp())
console.log()

Deno.exit();


export class URI {
	#authority;
	#fragment;
	#path;
	#query;
	#scheme;


	regExpStrings = {
		authority: '//(?<authority>[^/?#]*)',
		fragment: '#(?<fragment>.*)',
		path: '',
		query: '',
		scheme: '',
	};

	regExps = {
		authority: new RegExp(this.regExpStrings.authority, 'y'),
		fragment: new RegExp(this.regExpStrings.fragment, 'y'),
		path: /(?<path>[^?#]*)/y,
		query: /\?(?<query>[^#]*)/y,
		scheme: /\s*(?<scheme>[^:/]*):/y,
	};


	get authority() {
		return this.#authority;
	}

	set authority(authorityString) {
		if ( authorityString == undefined ) {
			this.#authority = undefined;

			return;
		}

		this.#authority = new Authority(authorityString);
	}


	get fragment() {
		return this.#fragment;
	}

	set fragment(fragmentString) {
		if ( fragmentString == undefined ) {
			this.#fragment = undefined;

			return;
		}

		this.#fragment = String(fragmentString);
	}


	get path() {
		return this.#path;
	}

	set path(pathString) {
		if ( pathString == undefined ) {
			this.#path = undefined;

			return;
		}

		this.#path = new Path(pathString);
	}


	get query() {
		return this.#query;
	}

	set query(queryString) {
		if ( queryString == undefined ) {
			this.#query = undefined;

			return;
		}

		this.#query = new Query(queryString);
	}


	get scheme() {
		return this.#scheme;
	}

	set scheme(schemeString) {
		if ( schemeString == undefined ) {
			this.#scheme = undefined;

			return;
		}

		this.#scheme = new Scheme(schemeString);
	}


	// TODO: Check this.
	get isURL() {
		if ( this.authority?.domain.fullDomain == undefined ) {
			return false;
		}

		return true;
	}


	constructor(uriString) {
		this.parseString(uriString);
	}


	parseString(uriString) {
		uriString = String(uriString);

		if ( ! uriString ) {
			return;
		}

		const regExps = this.regExps;

		const schemeRegExp = regExps.scheme;
		const authorityRegExp = regExps.authority;
		const pathRegExp = regExps.path;
		const queryRegExp = regExps.query;
		const fragmentRegExp = regExps.fragment;

		let lastIndex = 0;

		schemeRegExp.lastIndex = lastIndex;

		const schemeMatch = schemeRegExp.exec(uriString);

		if ( schemeMatch ) {
			this.scheme = schemeMatch.groups.scheme;

			lastIndex = schemeRegExp.lastIndex;
		}

		authorityRegExp.lastIndex = lastIndex;

		const authorityMatch = authorityRegExp.exec(uriString);

		if ( authorityMatch ) {
			this.authority = authorityMatch.groups.authority;

			lastIndex = authorityRegExp.lastIndex;
		}

		pathRegExp.lastIndex = lastIndex;

		const pathMatch = pathRegExp.exec(uriString);

		if ( pathMatch ) {
			this.path = pathMatch.groups.path;

			lastIndex = pathRegExp.lastIndex;
		}

		queryRegExp.lastIndex = lastIndex;

		const queryMatch = queryRegExp.exec(uriString);

		if ( queryMatch ) {
			this.query = queryMatch.groups.query;

			lastIndex = queryRegExp.lastIndex;
		}

		fragmentRegExp.lastIndex = lastIndex;

		const fragmentMatch = fragmentRegExp.exec(uriString);

		if ( fragmentMatch ) {
			this.fragment = fragmentMatch.groups.fragment;

			lastIndex = fragmentRegExp.lastIndex;
		}
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
}











const testStrings = [
	'scheme://username:password@a.b.c.domain.tld:port/path?query&key1=value1#fragment',
];

for ( const testString of testStrings ) {
	const uri = new URI(testString)

	console.log(uri.toString())
	console.log(uri)
}
