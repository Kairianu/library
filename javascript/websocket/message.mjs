import * as functions from '../function/function.mjs';
import * as object from '../object/object.mjs';


export function getEventMessageData(messageEvent, additionalMessageData) {
	const messageData = getMessageData(additionalMessageData);

	messageData.messageEvent = messageEvent;

	return messageData;
}

export function getMessageData(additionalMessageData) {
	const messageData = {};

	if ( object.shouldUseProperties(additionalMessageData) ) {
		Object.assign(messageData, additionalMessageData);
	}
	else if ( additionalMessageData != undefined ) {
		messageData.data = additionalMessageData;
	}

	return messageData;
}



export class MessageEvents {
	#messageEvents = {};


	getMessageEventHandler(name) {
		return this.#messageEvents[name];
	}

	removeMessageEvent(name) {
		const messageEvents = this.#messageEvents;

		if ( Object.hasOwn(messageEvents, name) ) {
			return delete messageEvents[name];
		}

		return false;
	}

	setMessageEvent(name, handler) {
		if ( ! functions.isFunction(handler) ) {
			return false;
		}

		this.#messageEvents[name] = handler;

		return true;
	}
}
