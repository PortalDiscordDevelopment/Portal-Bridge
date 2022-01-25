import { type WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { connected } from 'process';

interface Socket extends WebSocket {
	alive?: boolean;
	interval?: NodeJS.Timer;
	bot?: string;
	nodeVer?: string;
}

export class WebsocketHandler {
	private websocket: WebSocketServer;
	public static connected: {
		name: string;
		nodeVer: string;
	}[] = [];

	public constructor() {
		this.websocket = new WebSocketServer({
			noServer: true
		});
	}

	public async checkAlive(socket: Socket) {
		socket.ping();
		return new Promise((resolve, reject) => {
			const resolveCallback = () => {
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
		setInterval(() => {
			console.log(`Connected clients:\n${[...this.websocket.clients].map((sock: Socket) => `\t${sock.bot} (NodeJS v${sock.nodeVer})`).join('\n')}`);
		}, 5000)
		this.websocket.on('connection', async (socket: Socket) => {
			socket.alive = true;
			WebsocketHandler.connected.push({
				name: socket.bot!,
				nodeVer: socket.nodeVer!
			})
			socket.interval = setInterval(async () => {
				try {
					await this.checkAlive(socket);
				} catch {
					socket.alive = false;
					socket.terminate();
					clearInterval(socket.interval!);
				}
			}, 5000);
		});
	}

	public async connectWebsocket(server: Server) {
		server.on('upgrade', (request, socket, head) => {
			const match = request.headers['user-agent']?.match(/PortalBot (?<name>.+) \(NodeJS v(?<node>\d+\.\d+\.\d+)\)/);
			if (!match) {
				socket.write('Invalid user agent');
				socket.destroy();
				return;
			}
			this.websocket.handleUpgrade(request, socket, head, (socket: Socket) => {
				socket.bot = match.groups!.name;
				socket.nodeVer = match.groups!.node;
				this.websocket.emit('connection', socket, request);
			});
		});
	}
}
