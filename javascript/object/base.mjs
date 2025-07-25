export class BaseObject {
	#name;


	get name() {
		return this.#name || this.constructor.name;
	}

	set name(value) {
		this.#name = String(value);
	}


	formatMessage(message) {
		return `[${this.name}] ${message}`;
	}
}
