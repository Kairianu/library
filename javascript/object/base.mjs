import * as string from '../primitives/string.mjs';


export class BaseObject {
	#name;


	get name() {
		return this.#name || this.constructor.name;
	}

	set name(value) {
		const valueString = string.toString(value);

		if ( valueString ) {
			this.#name = valueString;
		}
	}


	formatMessage(message) {
		return `[${this.name}] ${message}`;
	}
}
