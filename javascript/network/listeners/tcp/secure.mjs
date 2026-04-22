import * as networkPort from '../../port.mjs';
import * as x509 from '../../../openssl/x509.mjs';

import { BaseObject } from '../../../object/base.mjs';


export async function buildListenOptions(options) {
	const listenOptions = getDefaultListenOptions();

	if ( typeof(options) == 'number' ) {
		listenOptions.port = options;
	}
	else {
		Object.assign(listenOptions, options);
	}

	if ( ! Object.hasOwn(listenOptions, 'cert') ) {
		const certificateInfo = await x509.getTemporaryCertificate();

		listenOptions.cert = certificateInfo.certificate;
		listenOptions.key = certificateInfo.privateKey;
	}

	return listenOptions;
}

export function getDefaultListenOptions() {
	return {
		alpnProtocols: ['h2', 'http/1.1'],
		port: networkPort.dynamicPort,
	};
}



export class SecureTCPListener extends BaseObject {
	#listener;
	#listenOptions;
	#opening = false;


	async #getListener() {
		while ( this.opening ) {
			await new Promise(resolve => setTimeout(resolve, 0));
		}

		return this.#listener;
	}



	constructor(...listenArgs) {
		super();

		if ( listenArgs.length > 0 ) {
			this.listen(...listenArgs);
		}
	}


	get closed() {
		if ( this.opening ) {
			return false;
		}

		return !(this.#listener);
	}

	get listenMethod() {
		return Deno.listenTls;
	}

	get opening() {
		return this.#opening;
	}

	get transport() {
		return 'tcp';
	}


	async accept() {
		const listener = await this.#getListener();

		return await listener?.accept();
	}

	async close() {
		const listener = await this.#getListener();

		try {
			listener?.close();
		} catch {}

		this.#listener = undefined;
	}

	async getHostname() {
		const listener = await this.#getListener();

		return listener?.addr.hostname;
	}

	async getListeningMessage() {
		const listeningText = await this.getListeningText();

		return this.formatMessage(listeningText);
	}

	async getListeningText() {
		const url = await this.getURL();

		if ( url ) {
			return 'Listening - ' + url;
		}

		return 'Closed';
	}

	async getPort() {
		const listener = await this.#getListener();

		return listener?.addr.port;
	}

	async getURL() {
		const urlHost = await this.getURLHost();

		if ( ! urlHost ) {
			return;
		}

		const transport = this.transport ?? '';

		return transport + '://' + urlHost;
	}

	async getURLHost() {
		const port = await this.getPort();
		const hostname = await this.getHostname();

		if ( hostname && port ) {
			return hostname + ':' + port;
		}
	}

	async listen(options, logListeningMessage) {
		this.#opening = true;

		try {
			this.#listener?.close();
		} catch {}

		const listenOptions = await buildListenOptions(options);

		this.#listener = this.listenMethod(listenOptions);

		this.#listenOptions = listenOptions;

		this.#opening = false;

		if ( logListeningMessage ) {
			const listeningMessage = await this.getListeningMessage();

			console.log(listeningMessage);
		}
	}


	async *[Symbol.asyncIterator]() {
		while ( true ) {
			const connection = await this.accept();

			if ( ! connection ) {
				break;
			}

			yield connection;
		}
	}
}





if ( import.meta.main ) {
	const secureTCPListener = new SecureTCPListener(undefined, true);

	for await ( const connection of secureTCPListener ) {
		const connectionDate = new Date().toISOString();

		const connectionDateString = '[' + connectionDate + ']';

		console.log(connectionDateString, connection);

		connection.close();
	}
}
