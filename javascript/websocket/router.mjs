import * as websocketMessage from './message.mjs';

import { EventWebSocket } from './socket.mjs';


export class EventWebSocketsRouter {
	static peerConnectedEventName = 'peerConnected';
	static peerDisconnectedEventName = 'peerDisconnected';



	#messageEvents = new websocketMessage.MessageEvents();
	#sockets = {};

	sendPeerConnectedEvent = false;
	sendPeerDisconnectedEvent = false;


	addSocket(...args) {
		const socket = new EventWebSocket(...args);

		socket.addEventListener('close', this.handleSocketClose.bind(this, socket));
		socket.addEventListener('open', this.handleSocketOpen.bind(this, socket));

		return socket;
	}

	addSocketFromRequest(request) {
		const socketInfo = Deno.upgradeWebSocket(request);

		const socket = this.addSocket(socketInfo.socket);

		return {
			response: socketInfo.response,
			socket,
		};
	}

	getHTTPResponse(request) {
		const socketInfo = this.addSocketFromRequest(request);

		return socketInfo.response;
	}

	getMessageEventHandler(...args) {
		return this.#messageEvents.getMessageEventHandler(...args);
	}

	getPeerMessageData(currentSocket, additionalMessageData) {
		const messageData = websocketMessage.getMessageData(additionalMessageData);

		messageData.peerID = this.getSocketID(currentSocket);

		return messageData;
	}

	getSocket(socketID) {
		return this.#sockets[socketID];
	}

	getSocketID(socket) {
		return socket?.id;
	}

	handleSocketClose(socket) {
		if ( this.sendPeerDisconnectedEvent ) {
			this.sendEventToAllPeers(socket, this.constructor.peerDisconnectedEventName);
		}

		const socketID = this.getSocketID(socket);

		delete this.#sockets[socketID];

		socket.router = undefined;
	}

	handleSocketOpen(socket) {
		const socketID = this.getSocketID(socket);

		const sockets = this.#sockets;

		if ( sockets[socketID] ) {
			socket.close(EventWebSocket.closeCodesInfo.badID);

			return;
		}

		sockets[socketID] = socket;

		socket.router = this;

		if ( this.sendPeerConnectedEvent ) {
			this.sendEventToAllPeers(socket, this.constructor.peerConnectedEventName);
		}
	}

	relayEventToAllPeers(currentSocket, receivedMessageData) {
		this.sendEventToAllPeers(
			currentSocket,
			receivedMessageData?.messageEvent,
			receivedMessageData
		);
	}

	relayEventToPeer(currentSocket, receivedMessageData) {
		return this.sendEventToPeer(
			currentSocket,
			receivedMessageData?.peerID,
			receivedMessageData?.messageEvent,
			receivedMessageData
		);
	}

	removeMessageEvent(...args) {
		return this.#messageEvents.removeMessageEvent(...args);
	}

	sendEventToAll(messageEvent, messageData, excludedSocketIDs) {
		if ( ! (excludedSocketIDs instanceof Set) ) {
			let setConstructorArg;

			if ( Array.isArray(excludedSocketIDs) ) {
				setConstructorArg = excludedSocketIDs
			}
			else {
				setConstructorArg = [excludedSocketIDs];
			}

			excludedSocketIDs = new Set(setConstructorArg);
		}

		for ( const [socketID, socket] of Object.entries(this.#sockets) ) {
			if ( excludedSocketIDs.has(socketID) ) {
				continue;
			}

			socket.sendEvent(messageEvent, messageData);
		}
	}

	sendEventToAllPeers(currentSocket, messageEvent, additionalMessageData) {
		const currentSocketID = this.getSocketID(currentSocket);

		const messageData = this.getPeerMessageData(currentSocket, additionalMessageData);

		this.sendEventToAll(messageEvent, messageData, currentSocketID);
	}

	sendEventToPeer(currentSocket, peerSocketID, messageEvent, additionalMessageData) {
		const peerSocket = this.getSocket(peerSocketID);

		if ( ! peerSocket ) {
			return false;
		}

		const messageData = this.getPeerMessageData(currentSocket, additionalMessageData);

		peerSocket.sendEvent(messageEvent, messageData);

		return true;
	}

	setMessageEvent(...args) {
		return this.#messageEvents.setMessageEvent(...args);
	}
}
