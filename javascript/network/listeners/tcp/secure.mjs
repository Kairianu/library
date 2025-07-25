import { BaseObject } from '../../../object/base.mjs';

import * as ipv4Address from '../../address/ipv4.mjs';
import * as networkPort from '../../port.mjs';


export class SecureTCPListener extends BaseObject {
	#listener;


	static getDefaultListenOptions() {
		return {
			alpnProtocols: ['h2', 'http/1.1'],
			port: networkPort.dynamicPort,
		};
	}


	constructor(listenOptions) {
		super();

		if ( listenOptions !== undefined ) {
			this.listen(listenOptions);
		}
	}


	get hostname() {
		return this.#listener?.addr.hostname;
	}

	get listeningMessage() {
		return this.formatMessage(this.listeningText);
	}

	get listeningText() {
		const url = this.url;

		if ( url ) {
			return 'Listening - ' + url;
		}

		return 'Closed';
	}

	get listenMethod() {
		return Deno.listenTls;
	}

	get port() {
		return this.#listener?.addr.port;
	}

	get transport() {
		return 'tcp';
	}

	get url() {
		const urlHost = this.urlHost;

		if ( ! urlHost ) {
			return;
		}

		const protocol = this.protocol || this.transport;

		return protocol + '://' + urlHost;
	}

	get urlHost() {
		const port = this.port;
		const urlHostname = this.urlHostname;

		if ( urlHostname && port ) {
			return urlHostname + ':' + port;
		}
	}

	get urlHostname() {
		let hostname = this.hostname;

		if ( hostname == ipv4Address.hostAddress ) {
			hostname = ipv4Address.localhostAddress;
		}

		return hostname;
	}


	async accept() {
		return await this.#listener?.accept();
	}

	close() {
		try {
			this.#listener?.close();
		} catch {}

		this.#listener = undefined;
	}

	getDefaultListenOptions() {
		return this.constructor.getDefaultListenOptions();
	}

	isClosed() {
		return ! this.#listener;
	}

	async listen(listenOptions) {
		this.close();

		listenOptions = Object.assign(
			this.getDefaultListenOptions(),
			listenOptions
		);

		this.#listener = this.listenMethod(listenOptions);
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
