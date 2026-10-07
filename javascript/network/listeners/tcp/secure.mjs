import { BaseObject } from '../../../object/base.mjs';
import * as ipv6 from '../../address/ipv6.mjs';
import * as networkAddress from '../../address/address.mjs';
import * as networkPort from '../../port.mjs';
import * as object from '../../../primitives/object.mjs';


/** TODO: Possibly make a library for assigning objects.
 * Options to not assign undefined values.
 * Option to type checking values.
*/
export function getListenOptions(options) {
	const listenOptions = {
		alpnProtocols: ['h2', 'http/1.1'],
		hostname: ipv6.hostAddress,
		port: networkPort.dynamicPort,
		reusePort: false,
		tcpBacklog: 511,
		transport: 'tcp',
	};

	const optionsType = typeof(options);

	if ( optionsType == 'number' ) {
		const port = options;

		if ( networkPort.isValidPort(port) ) {
			listenOptions.port = port;
		}
	}
	// TODO: Make a library to parse ipv4 and ipv6 host string.
	else if ( optionsType == 'string' ) {
		const host = options;

		listenOptions.hostname = host;
	}
	else if ( object.shouldUseProperties(options) ) {
		Object.assign(listenOptions, options);
	}

	return listenOptions;
}



export class SecureTCPListener extends BaseObject {
	#closed = true;
	#listener;
	#listenOptions;


	get closed() {
		return this.#closed;
	}

	get createListenerMethod() {
		return Deno.listenTls;
	}

	get host() {
		if ( this.closed ) {
			return;
		}

		return networkAddress.getHostAddress(this.hostname, this.port);
	}

	get hostname() {
		if ( this.closed ) {
			return;
		}

		return this.#listener?.addr.hostname;
	}

	get listener() {
		return this.#listener;
	}

	get listeningMessage() {
		return this.formatMessage(this.listeningText);
	}

	get listeningText() {
		if ( this.closed ) {
			return 'Closed';
		}

		const host = this.host;
		const url = this.url;

		let hostString;

		if ( url ) {
			if ( url.includes(host) ) {
				hostString = url;
			}
			else {
				hostString = `${host} (${url})`;
			}
		}
		else {
			hostString = host;
		}

		return `Listening via ${this.transport} on ${hostString}`;
	}

	get port() {
		if ( this.closed ) {
			return;
		}

		return this.#listener?.addr.port;
	}

	get routableHost() {
		if ( this.closed ) {
			return;
		}

		return networkAddress.getHostAddress(this.routableHostname, this.port);
	}

	get routableHostname() {
		if ( this.closed ) {
			return;
		}

		return networkAddress.getRoutableAddress(this.hostname);
	}

	get transport() {
		return this.#listener?.addr.transport ?? 'tcp';
	}

	get url() {
		const protocol = this.protocol;

		if ( ! protocol ) {
			return;
		}

		const host = this.routableHost;

		if ( ! host ) {
			return;
		}

		return protocol + '://' + host;
	}


	async accept() {
		return await this.#listener?.accept();
	}

	blockEventLoop() {
		this.#listener?.ref();
	}

	cloneListenOptions() {
		return structuredClone(this.#listenOptions);
	}

	async close(ensureClosure) {
		const listener = this.#listener;

		if ( listener ) {
			try {
				listener.close();

				if ( ensureClosure ) {
					await listener.accept();
				}
			} catch {}
		}

		this.#closed = true;
	}

	async listen(options) {
		await this.close(true);

		const listenOptions = getListenOptions(options);

		this.#listener = this.createListenerMethod(listenOptions);

		this.#closed = false;

		this.#listenOptions = listenOptions;
	}

	unblockEventLoop() {
		this.#listener?.unref();
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
