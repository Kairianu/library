import * as event from '../event/event.mjs';

import * as websocket from './socket.mjs';
import * as websocketMessage from './message.mjs';


const routerSockets = new WeakMap();


function handleSocketClose(router, socket) {
	if ( router.sendPeerDisconnectedEvent ) {
		sendEventToAllPeers(router, socket, router.peerDisconnectedEventName);
	}

	const socketID = getSocketID(router, socket);

	delete router.sockets[socketID];

	routerSockets.delete(socket);
}

function handleSocketOpen(router, socket) {
	if ( routerSockets.has(socket) ) {
		return;
	}

	const socketID = getNewSocketID();

	router.sockets[socketID] = socket;

	routerSockets.set(socket, router);

	socket.addEventListener('close', handleSocketClose.bind(undefined, router, socket));

	if ( router.sendPeerConnectedEvent ) {
		sendEventToAllPeers(router, socket, router.peerConnectedEventName);
	}
}



export function getNewRouter() {
	const router = {
		peerConnectedEventName: 'peerConnected',
		peerDisconnectedEventName: 'peerDisconnected',
		sendPeerConnectedEvent: false,
		sendPeerDisconnectedEvent: false,
		sockets: {},
	};

	return router;
}

export function getNewSocketID() {
	return crypto.randomUUID();
}

export function getRouterForSocket(socket) {
	return routerSockets.get(socket);
}



export function addSocket(router, socket) {
	if ( ! (socket instanceof WebSocket) ) {
		throw new TypeError(
			'Socket must be an instance of WebSocket.'
		)
	}

	const socketReadyState = socket?.readyState;

	if ( socketReadyState == WebSocket.CONNECTING ) {
		socket.addEventListener('open', handleSocketOpen.bind(undefined, router, socket));
	}
	else if ( socketReadyState == WebSocket.OPEN ) {
		handleSocketOpen(router, socket);
	}
	else {
		return false;
	}

	return true;
}

export function addSocketFromRequest(router, request) {
	const upgradeSocketInfo = Deno.upgradeWebSocket(request);

	const socketAdded = addSocket(router, upgradeSocketInfo.socket);

	const socketInfo = {
		socketAdded,
	};

	Object.assign(socketInfo, upgradeSocketInfo);

	return socketInfo;
}

export function closeAllSockets(router) {
	for ( const socket of Object.values(router.sockets) ) {
		socket.close();
	}
}

export function getHTTPResponse(router, request) {
	const socketInfo = addSocketFromRequest(router, request);

	websocket.setupWebSocket(socketInfo.socket);

	return socketInfo.response;
}

export function getPeerMessageData(router, currentSocket, additionalMessageData) {
	const messageData = websocketMessage.getMessageData(additionalMessageData);

	messageData.peerID = getSocketID(router, currentSocket);

	return messageData;
}

export function getSocketID(router, socket) {
	for ( const [socketID, routerSocket] of Object.entries(router.sockets) ) {
		if ( Object.is(routerSocket, socket) ) {
			return socketID;
		}
	}
}

export function relayEventToAllPeers(router, currentSocketOrEvent, messageData) {
	const currentSocket = event.getCurrentTarget(currentSocketOrEvent);

	sendEventToAllPeers(
		router,
		currentSocket,
		messageData?.messageEvent,
		messageData
	);
}

export function relayEventToPeer(router, currentSocketOrEvent, messageData) {
	const currentSocket = event.getCurrentTarget(currentSocketOrEvent);

	return sendEventToPeer(
		router,
		currentSocket,
		messageData?.peerID,
		messageData?.messageEvent,
		messageData
	);
}

export function sendEventToAll(router, messageEvent, messageData, excludedSockets) {
	if ( ! Array.isArray(excludedSockets) ) {
		excludedSockets = [excludedSockets];
	}

	for ( const socket of Object.values(router.sockets) ) {
		if ( excludedSockets.includes(socket) ) {
			continue;
		}

		websocket.sendEvent(socket, messageEvent, messageData);
	}
}

export function sendEventToAllPeers(router, currentSocket, messageEvent, additionalMessageData) {
	const messageData = getPeerMessageData(router, currentSocket, additionalMessageData);

	sendEventToAll(router, messageEvent, messageData, currentSocket);
}

export function sendEventToPeer(router, currentSocket, peerSocketID, messageEvent, additionalMessageData) {
	const peerSocket = router.sockets[peerSocketID];

	if ( ! peerSocket ) {
		return false;
	}

	const messageData = getPeerMessageData(router, currentSocket, additionalMessageData);

	websocket.sendEvent(peerSocket, messageEvent, messageData);

	return true;
}
