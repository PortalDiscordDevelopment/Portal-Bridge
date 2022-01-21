import { HttpHandler } from './app';
import { WebsocketHandler } from './ws';

(async () => {
	console.log('Initializing websocket...');
	const wsHandler = new WebsocketHandler();
	wsHandler.initWebsocket();
	console.log('Initializing webserver...');
	const httpHandler = new HttpHandler();
	await httpHandler.registerRoutes();
	console.log('Starting webserver...');
	const server = httpHandler.startServer();
	server.on('listening', () => console.log('Webserver started!'));
	wsHandler.connectWebsocket(server);
})();
