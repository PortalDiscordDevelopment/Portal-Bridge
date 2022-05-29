import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { Bot } from './models/Bot';
import { fetch } from 'undici';
import { APIUser } from 'discord-api-types/v10';
import { s } from '@sapphire/shapeshift';
import * as result from '@sapphire/result';
import type {
	ClientToServerEvents,
	SocketData,
	SocketHandshakeData
} from './types';

export class WebsocketHandler {
	public static websocket: Server<ClientToServerEvents, {}, {}, SocketData>;

	public async initWebsocket(server: HttpServer) {
		WebsocketHandler.websocket = new Server(server);
		WebsocketHandler.websocket.use(async (socket, next) => {
			const {
				success: validationSuccess,
				error: validationError,
				value: handshakeData
			} = result.from(() =>
				s
					.object<SocketHandshakeData>({
						token: s.string.regex(/[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}/),
						name: s.string,
						platform: s.string,
						platformVersion: s.string
					})
					.strict.parse(socket.handshake.auth)
			);

			if (!validationSuccess) {
				next(validationError as Error);
				return;
			}

			let bot: APIUser;
			try {
				bot = (await fetch('https://discord.com/api/v10/users/@me', {
					method: 'GET',
					headers: {
						Authorization: `Bot ${handshakeData.token}`
					}
				}).then((r) => r.json())) as APIUser;
			} catch {
				next(new Error('Invalid bot token'));
				return;
			}
			if (bot.username != handshakeData.name) {
				next(new Error('User agent name does not match discord bot username'));
				return;
			}
			socket.data.name = bot.username;
			socket.data.token = handshakeData.token;
			socket.data.platform = handshakeData.platform;
			socket.data.platformVersion = handshakeData.platformVersion;
			next();
		});
		WebsocketHandler.websocket.on('connection', async (socket) => {
			// Set connected date
			socket.data.connectedAt = new Date();
			// Add listener for bot stats
			socket.on('guildCount', async (count) => {
				console.log(`Socket ${socket.data.name} sent guild count ${count}`);
				const [bot] = await Bot.findOrBuild({
					where: {
						name: socket.data.name
					},
					defaults: {
						name: socket.data.name!
					}
				});
				bot.guildCount = count;
				await bot.save();
			});
		});
	}
}
