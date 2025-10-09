import * as functions from '../function/function.mjs';
import * as object from '../object/object.mjs';

import * as websocketMessage from './message.mjs';
import * as websocketRouter from './router.mjs';


export function setupWebSocket(socketOrURL, ...args) {
	let socket;

	if ( socketOrURL instanceof WebSocket ) {
		socket = socketOrURL;
	}
	else {
		socket = new WebSocket(socketOrURL, ...args);
	}

	socket.addEventListener('message', handleMessage);

	return socket;
}



export function getMessageEventHandler(socket, ...args) {
	const messageEventHandler = websocketMessage.getMessageEventHandler(socket, ...args);

	if ( messageEventHandler ) {
		return messageEventHandler;
	}

	const router = websocketRouter.getRouterForSocket(socket);

	if ( router ) {
		return websocketMessage.getMessageEventHandler(router, ...args);
	}
}

export function handleMessage(event) {
	const messageData = parseMessageData(event.data);

	if ( ! messageData ) {
		return;
	}

	const currentSocket = event.currentTarget;

	const messageEvent = messageData.messageEvent;

	const messageEventHandler = getMessageEventHandler(currentSocket, messageEvent);

	if ( functions.isFunction(messageEventHandler) ) {
		messageEventHandler(event, messageData);
	}
}

export function parseMessageData(value) {
	let messageData;

	try {
		messageData = JSON.parse(value);
	}
	catch {
		return;
	}

	if ( ! object.isObject(messageData) ) {
		return;
	}

	return messageData;
}

export function sendEvent(socket, ...args) {
	const eventMessageData = websocketMessage.getEventMessageData(...args);

	const dataString = JSON.stringify(eventMessageData);

	socket.send(dataString);
}
