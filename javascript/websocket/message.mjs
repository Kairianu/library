import * as functions from '../function/function.mjs';
import * as object from '../object/object.mjs';


const ownersMessageEvents = new WeakMap();

function getOwnerMessageEvents(owner) {
	let ownerMessageEvents = ownersMessageEvents.get(owner);

	if ( ! ownerMessageEvents ) {
		ownerMessageEvents = {};

		ownersMessageEvents.set(owner, ownerMessageEvents);
	}

	return ownerMessageEvents;
}



export function getEventMessageData(messageEvent, additionalMessageData) {
	const messageData = getMessageData(additionalMessageData);

	messageData.messageEvent = messageEvent;

	return messageData;
}

export function getMessageData(additionalMessageData) {
	const messageData = {};

	if ( additionalMessageData != undefined ) {
		if ( object.shouldUseProperties(additionalMessageData) ) {
			Object.assign(messageData, additionalMessageData);
		}
		else {
			messageData.data = additionalMessageData;
		}
	}

	return messageData;
}



export function getMessageEventHandler(owner, name) {
	const messageEvents = getOwnerMessageEvents(owner);

	return messageEvents[name];
}

export function removeMessageEvent(owner, name) {
	const messageEvents = getOwnerMessageEvents(owner);

	if ( Object.hasOwn(messageEvents, name) ) {
		return delete messageEvents[name];
	}

	return false;
}

export function setMessageEvent(owner, name, handler) {
	if ( ! functions.isFunction(handler) ) {
		return false;
	}

	const messageEvents = getOwnerMessageEvents(owner);

	messageEvents[name] = handler;

	return true;
}
