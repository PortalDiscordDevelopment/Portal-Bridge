import { Server, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { Bot } from './models/Bot';

export class WebsocketHandler {
	public static websocket: Server<ClientToServerEvents, {}, {}, SocketData>;

	public async initWebsocket(server: HttpServer) {
		WebsocketHandler.websocket = new Server(server)
		WebsocketHandler.websocket.use((socket, next) => {
			if (typeof socket.handshake.query?.['User-Agent'] == 'string') {
				const match = socket.handshake.query['User-Agent'].match(
					/PortalBot (?<name>.+) \(NodeJS v(?<node>\d+\.\d+\.\d+)\)/
				);
				if (!match) {
					next(new Error('Invalid user agent'));
					return;
				}
				socket.data.bot = match.groups!.name
				socket.data.nodeVer = match.groups!.node
				next();
			} else {
				next(new Error('No user agent provided'));
			}
		});
		WebsocketHandler.websocket.on('connection', async (socket) => {
			socket.on('guildCount', async count => {
				console.log(`Socket ${socket.data.bot} sent guild count ${count}`)
				const [bot] = await Bot.findOrBuild({
					where: {
						name: socket.data.bot
					},
					defaults: {
						name: socket.data.bot!
					}
				})
				bot.guildCount = count;
				await bot.save();
			})
		});
	}
}
