import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { Bot } from './models/Bot';
import { generateToken } from './util';
import { fetch } from 'undici';
import { APIUser } from 'discord-api-types/v10';

export class WebsocketHandler {
	public static websocket: Server<ClientToServerEvents, {}, {}, SocketData>;

	public async initWebsocket(server: HttpServer) {
		WebsocketHandler.websocket = new Server(server);
		WebsocketHandler.websocket.use(async (socket, next) => {
			if (typeof socket.handshake.headers['user-agent'] != 'string') {
				next(new Error('No user agent provided'));
				return;
			}
			if (typeof socket.handshake.auth.token != 'string') {
				next(new Error('No token provided'));
				return;
			}
			const match = socket.handshake.headers['user-agent'].match(
				/PortalBot (?<name>.+) \(NodeJS v(?<node>\d+\.\d+\.\d+)\)/
			);
			if (!match) {
				next(new Error('Invalid user agent'));
				return;
			}
			let bot: APIUser;
			try {
				bot = (await fetch('https://discord.com/api/v10/users/@me', {
					method: 'GET',
					headers: {
						Authorization: `Bot ${socket.handshake.auth.token}`
					}
				}).then((r) => r.json())) as APIUser;
			} catch {
				next(new Error('Invalid token'));
				return;
			}
			if (bot.username != match.groups!.name) {
				next(new Error('User agent name does not match discord bot username'));
				return;
			}
			socket.data.bot = bot.username;
			socket.data.nodeVer = match.groups!.node;
			socket.data.userAgent = socket.handshake.headers['user-agent'];
			socket.data.token = socket.handshake.auth.token;
			socket.data.apiToken = await generateToken();
			next();
		});
		WebsocketHandler.websocket.on('connection', async (socket) => {
			socket.data.connectedAt = new Date();
			socket.on('guildCount', async (count) => {
				console.log(`Socket ${socket.data.bot} sent guild count ${count}`);
				const [bot] = await Bot.findOrBuild({
					where: {
						name: socket.data.bot
					},
					defaults: {
						name: socket.data.bot!
					}
				});
				bot.guildCount = count;
				await bot.save();
			});
			socket.on('getToken', async (cb) => {
				cb(socket.data.apiToken!);
			});
		});
	}
}
