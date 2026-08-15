let apiToken;
let zoneID;


// TODO: Create a library for Fail.
class Fail {
	static createFromError(error) {
		return new this(
			`[${error.name}] ${error.message}`,
			{
				cause: error.cause,
			}
		);
	}



	#args;
	#message;


	get args() {
		return this.#args;
	}

	set args(value) {
		if ( typeof(value) == 'object' ) {
			this.#args = value;
		}
	}


	get message() {
		return this.#message;
	}

	set message(value) {
		this.#message = String(value);
	}


	get success() {
		return false;
	}


	constructor(message, args) {
		this.message = message;
		this.args = args;
	}


	output() {
		const args = this.args;
		const message = `[FAIL] ${this.message}`;

		console.error('--- FAIL ' + '-'.repeat(41));

		console.error(message);

		if ( args ) {
			console.error(args);
		}

		console.error('--- END FAIL ' + '-'.repeat(37));
	}

	toString() {
		return `[FAIL] ${this.message}`;
	}
}





function getIPVersionFromDNSRecordType(dnsRecordType) {
	const dnsRecordTypes = new Map([
		['A', 4],
		['AAAA', 6],
	]);

	return dnsRecordTypes.get(dnsRecordType);
}

function getValidIPVersion(ipVersion) {
	return parseInt(ipVersion) == 4 ? 4 : 6;
}





async function getPublicIP(ipVersion) {
	ipVersion = getValidIPVersion(ipVersion);

	const url = `https://ipv${ipVersion}.icanhazip.com`;

	let response;

	try {
		response = await fetch(url);
	}
	catch(error) {
		return Fail.createFromError(error);
	}

	if ( ! response.ok ) {
		return new Fail(
			'HTTP request for getting public IP failed.',
			{
				response,
			},
		);
	}

	const responseText = await response.text();

	const publicIP = responseText.trim();

	if ( ! publicIP ) {
		return new Fail('Response returned empty.');
	}

	return publicIP;
}



async function deleteDNSRecord(dnsRecordID) {
	if ( typeof(dnsRecordID) != 'string' || ! dnsRecordID ) {
		return new Fail(
			'DNS record id must be a non-empty string.',
			{
				dnsRecordID,
			}
		);
	}

	const url = `https://api.cloudflare.com/client/v4/zones/${zoneID}/dns_records/${dnsRecordID}`;

	let response;

	try {
		response = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${apiToken}`,
			},
			method: 'DELETE',
		});
	}
	catch(error) {
		return Fail.createFromError(error);
	}

	if ( ! response.ok ) {
		return new Fail(
			'HTTP request for DNS record deletion failed.',
			{
				response,
			}
		);
	}

	const responseInfo = await response.json();

	const dateString = new Date().toISOString();
	const status = responseInfo.success ? 'SUCCESS' : 'FAIL';

	const message = `[${dateString}] [${status}] deleteDNSRecord(${dnsRecordID}) => ${responseInfo.result.id}`;

	console.log(message);

	return responseInfo;
}

async function getDNSRecords(filters) {
	const url = `https://api.cloudflare.com/client/v4/zones/${zoneID}/dns_records`;

	let response;

	try {
		response = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${apiToken}`,
			},
			method: 'GET',
		});
	}
	catch(error) {
		return Fail.createFromError(error);
	}

	if ( ! response.ok ) {
		return new Fail(
			'HTTP request for DNS records failed.',
			{
				response,
			}
		);
	}

	const dnsRecordsInfo = await response.json();

	if ( ! dnsRecordsInfo.success ) {
		return new Fail(
			'Cloudflare success failed.',
			{
				dnsRecordsInfo: dnsRecordsInfo,
			}
		);
	}

	const dnsRecords = [];

	for ( const dnsRecordInfo of dnsRecordsInfo.result ) {
		if ( filters != undefined ) {
			let shouldFilter = false;

			if ( filters != undefined ) {
				for ( const [filterKey, filterValue] of Object.entries(filters) ) {
					if ( dnsRecordInfo[filterKey] != filterValue ) {
						shouldFilter = true;

						break;
					}
				}
			}

			if ( shouldFilter ) {
				continue;
			}
		}

		dnsRecords.push(dnsRecordInfo);
	}

	return dnsRecords;
}

async function updateDNSRecord(dnsRecordType='AAAA', options) {
	const ipVersion = getIPVersionFromDNSRecordType(dnsRecordType);

	if ( ! ipVersion ) {
		return new Fail(
			'Cannot get a valid IP version from dns record type.',
			{
				dnsRecordType: dnsRecordType,
			},
		);
	}

	const publicIP = options?.publicIP || await getPublicIP(ipVersion);

	if ( publicIP instanceof Fail ) {
		return publicIP;
	}

	const dnsRecordsInfo = await getDNSRecords({
		type: dnsRecordType,
	});

	const dnsRecordInfo = dnsRecordsInfo[0];

	let method;
	let url = `https://api.cloudflare.com/client/v4/zones/${zoneID}/dns_records`;

	if ( dnsRecordInfo ) {
		method = 'PUT';
		url += `/${dnsRecordInfo.id}`;
	}
	else {
		method = 'POST';
	}

	const name = options?.name ?? '@';
	const ttl = options?.ttl ?? 60;
	const proxied = !!(options?.proxied ?? false);

	const bodyData = {
		content: publicIP,
		name: name,
		proxied: proxied,
		ttl: ttl,
		type: dnsRecordType,
	};

	let response;

	try {
		response = await fetch(url, {
			body: JSON.stringify(bodyData),
			headers: {
				'Authorization': `Bearer ${apiToken}`,
				'Content-Type': 'application/json',
			},
			method: method,
		});
	}
	catch(error) {
		return Fail.createFromError(error);
	}

	if ( ! response.ok ) {
		return new Fail(
			'HTTP request for DNS record update failed.',
			{
				response,
			}
		);
	}

	const responseInfo = await response.json();

	const status = responseInfo.success ? 'SUCCESS' : 'FAIL';
	const dateString = new Date().toISOString();

	const message = `[${dateString}] [${status}] updateDNSRecord(${dnsRecordType}) => ${responseInfo.result.content}`;

	console.log(message);

	return responseInfo;
}

async function updateDNSRecordLoop() {
	const failTimeout = 10 * 1000;
	const successTimeout = 10 * 60 * 1000;

	let dnsIP;
	let timeout;

	while ( true ) {
		const publicIP = await getPublicIP();

		if ( publicIP instanceof Fail ) {
			timeout = failTimeout;
		}
		else if ( publicIP == dnsIP ) {
			timeout = successTimeout;
		}
		else {
			const dnsRecordInfo = await updateDNSRecord(undefined, {
				publicIP: publicIP,
			});

			if ( dnsRecordInfo instanceof Fail ) {
				timeout = failTimeout;
			}
			else {
				if ( dnsRecordInfo.success ) {
					dnsIP = dnsRecordInfo.result.content;
					timeout = successTimeout;
				}
				else {
					timeout = failTimeout;
				}
			}
		}

		await new Promise(resolve => setTimeout(resolve, timeout));
	}
}





if ( import.meta.main ) {
	apiToken = Deno.args[0];
	zoneID = Deno.args[1];

	if ( ! apiToken || ! zoneID ) {
		throw new Error('Must supply API token and zone ID.');
	}

	updateDNSRecordLoop();
}
