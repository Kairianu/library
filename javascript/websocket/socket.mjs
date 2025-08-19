import * as functions from '../function/function.mjs';
import * as object from '../object/object.mjs';

import * as websocketMessage from './message.mjs';


export class EventWebSocket {
	static closeCodesInfo = {
		badID: {
			code: 4010,
			reason: 'Bad socket id',
		},
	};

	static proxyHandler = {
		get: this.proxyGet,
		set: this.proxySet,
	};


	static getCloseCodeInfoArgs(closeCodeInfo) {
		return [
			closeCodeInfo?.code,
			closeCodeInfo?.reason,
		];
	}

	static getNewID() {
		return crypto.randomUUID();
	}

	static proxyGet(target, propertyKey) {
		const valueTarget = EventWebSocket.proxyGetValueTarget(target, propertyKey);

		if ( valueTarget == undefined ) {
			return;
		}

		let value = valueTarget[propertyKey];

		if ( functions.isFunction(value) ) {
			value = value.bind(valueTarget);
		}

		return value;
	}

	static proxyGetValueTarget(target, propertyKey) {
		if ( propertyKey in target ) {
			return target;
		}

		return target.socket;
	}

	static proxySet(target, propertyKey, value) {
		const valueTarget = EventWebSocket.proxyGetValueTarget(target, propertyKey);

		valueTarget[propertyKey] = value;

		return true;
	}



	#id = this.constructor.getNewID();
	#messageEvents = new websocketMessage.MessageEvents();
	#proxy;
	#router;
	#socket;


	get id() {
		return this.#id;
	}

	get router() {
		return this.#router;
	}

	set router(value) {
		this.#router = value;
	}

	get socket() {
		return this.#socket;
	}


	constructor(socketOrURL, ...args) {
		let socket;

		if ( socketOrURL instanceof WebSocket ) {
			socket = socketOrURL;
		}
		else {
			socket = new WebSocket(socketOrURL, ...args);
		}

		this.#socket = socket;

		const proxy = new Proxy(this, this.constructor.proxyHandler);

		this.#proxy = proxy;

		this.addEventListener('message', this.handleMessage.bind(this));

		return proxy;
	}


	addEventListener(eventType, listener, ...args) {
		const listenerWrapper = (event, ...listenerWrapperArgs) => {
			Object.defineProperty(event, 'currentTarget', {
				configurable: true,
				enumerable: true,
				writable: false,
				value: this.#proxy,
			});

			listener(event, ...listenerWrapperArgs);
		};

		this.socket.addEventListener(eventType, listenerWrapper, ...args);

		return listenerWrapper;
	}

	close(codeOrCloseCodeInfo, reason, ...args) {
		let code;

		if ( object.shouldUseProperties(codeOrCloseCodeInfo) ) {
			code = codeOrCloseCodeInfo.code;

			if ( reason == undefined ) {
				reason = codeOrCloseCodeInfo.reason;
			}
		}
		else {
			code = codeOrCloseCodeInfo;
		}

		return this.socket.close(code, reason, ...args);
	}

	getMessageEventHandler(...args) {
		const messageEventHandler = this.#messageEvents.getMessageEventHandler(...args);

		if ( functions.isFunction(messageEventHandler) ) {
			return messageEventHandler;
		}

		const router = this.router;

		if ( functions.isFunction(router?.getMessageEventHandler) ) {
			const routerMessageEventHandler = router.getMessageEventHandler(...args);

			if ( functions.isFunction(routerMessageEventHandler) ) {
				return routerMessageEventHandler;
			}
		}
	}

	handleMessage(event) {
		let messageData;

		try {
			messageData = JSON.parse(event.data);
		}
		catch {
			return;
		}

		const messageEvent = messageData.messageEvent;

		const messageEventHandler = this.getMessageEventHandler(messageEvent);

		if ( functions.isFunction(messageEventHandler) ) {
			messageEventHandler(event, messageData);
		}
	}

	removeMessageEvent(...args) {
		return this.#messageEvents.removeMessageEvent(...args);
	}

	sendEvent(...args) {
		const eventMessageData = websocketMessage.getEventMessageData(...args);

		const dataString = JSON.stringify(eventMessageData);

		this.socket.send(dataString);
	}

	setMessageEvent(...args) {
		return this.#messageEvents.setMessageEvent(...args);
	}
}
