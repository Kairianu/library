import { SecureTCPListener } from '../../network/listeners/tcp/secure.mjs';

import * as httpResponse from '../response.mjs';


export class SecureHTTPServer extends SecureTCPListener {
	get protocol() {
		return 'https';
	}


	async getHTTPResponse() {
		return httpResponse.getNotFoundResponse();
	}

	async handleConnection(connection) {
		let httpConnection;

		try {
			httpConnection = Deno.serveHttp(connection);
		}
		catch {
			return;
		}

		const addresses = {
			local: Object.assign({}, connection.localAddr),
			remote: Object.assign({}, connection.remoteAddr),
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
		const response = await this.getHTTPResponse(httpRequestData.request, addresses);

		try {
			await httpRequestData.respondWith(response);
		} catch {}
	}

	async listen(listenOptions) {
		await super.listen(listenOptions);

		this.startConnectionLoop();
	}

	async startConnectionLoop() {
		for await ( const connection of this ) {
			this.handleConnection(connection);
		}
	}
}
