import { SecureTCPListener } from '../../network/listeners/tcp/secure.mjs';

import * as httpResponse from '../response.mjs';


export class SecureHTTPServer extends SecureTCPListener {
	#getHTTPResponse = () => httpResponse.getNotFoundResponse();


	get protocol() {
		return 'https';
	}


	async #runConnectionLoop() {
		for await ( const connection of this ) {
			this.handleConnection(connection);
		}
	}


	async handleConnection(connection) {
		let httpConnection;

		try {
			// TODO: Possibly make your own http connection method since Deno.serveHttp is deprecated.
			httpConnection = Deno.serveHttp(connection);
		}
		catch {
			return;
		}

		const addresses = {
			local: Object.assign(Object.create(null), connection.localAddr),
			remote: Object.assign(Object.create(null), connection.remoteAddr),
		};

		this.handleHTTPConnection(httpConnection, addresses);
	}

	async handleHTTPConnection(httpConnection, addresses) {
		while ( true ) {
			let httpRequestData;

			try {
				httpRequestData = await httpConnection.nextRequest();
			} catch {}

			if ( ! httpRequestData ) {
				break;
			}

			this.handleHTTPRequestData(httpRequestData, addresses);
		}
	}

	async handleHTTPRequestData(httpRequestData, addresses) {
		const response = await this.#getHTTPResponse(httpRequestData.request, addresses);

		try {
			await httpRequestData.respondWith(response);
		} catch {}
	}

	async listen(...args) {
		await super.listen(...args);

		this.#runConnectionLoop();
	}

	setRequestHandler(requestHandler) {
		if ( typeof(requestHandler) == 'function' ) {
			this.#getHTTPResponse = requestHandler;
		}
	}
}
