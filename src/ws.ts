import { type WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';

interface Socket extends WebSocket {
	alive: boolean;
	interval: NodeJS.Timer;
}

export class WebsocketHandler {
	private websocket: WebSocketServer;

	public constructor() {
		this.websocket = new WebSocketServer({
			noServer: true
		});
	}

	public async checkAlive(socket: Socket) {
		socket.ping();
		console.log('<== pinging');
		return new Promise((resolve, reject) => {
			const resolveCallback = () => {
				console.log('==> ponged');
				resolve(true);
			};
			socket.once('pong', resolveCallback);
			setTimeout(() => {
				socket.removeListener('pong', resolveCallback);
				reject(new Error('Alive check timed out'));
			}, 2000);
		});
	}

	public async initWebsocket() {
		this.websocket.on('connection', async (socket: Socket) => {
			socket.alive = true;
			socket.interval = setInterval(async () => {
				try {
					const alive = await this.checkAlive(socket);
				} catch {
					socket.alive = false;
					socket.terminate();
					clearInterval(socket.interval);
				}
			}, 5000);
			socket.on('message', (data) => {
				console.log(`==> ${data}`);
			});
		});
	}

	public async connectWebsocket(server: Server) {
		server.on('upgrade', (request, socket, head) => {
			this.websocket.handleUpgrade(request, socket, head, (socket) => {
				this.websocket.emit('connection', socket, request);
			});
		});
	}
}
