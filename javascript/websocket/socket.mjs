import * as functions from '../function/function.mjs';

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
	let messageData;

	try {
		messageData = JSON.parse(event.data);
	}
	catch {
		return;
	}

	const messageEvent = messageData.messageEvent;

	const messageEventHandler = getMessageEventHandler(event.currentTarget, messageEvent);

	if ( functions.isFunction(messageEventHandler) ) {
		messageEventHandler(event, messageData);
	}
}

export function sendEvent(socket, ...args) {
	const eventMessageData = websocketMessage.getEventMessageData(...args);

	const dataString = JSON.stringify(eventMessageData);

	socket.send(dataString);
}
