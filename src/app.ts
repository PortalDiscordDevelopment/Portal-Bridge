import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { APIUser } from 'discord-api-types/v10';
import express, {
	Request,
	RequestHandler,
	Response,
	type Express
} from 'express';
import { promises as fs } from 'fs';
import { fetch } from 'undici';
import { createServer, Server } from 'http';
import { join } from 'path';
import * as config from './config';
import { WebsocketHandler } from './ws';

export class HttpHandler {
	private app: Express;
	public server: Server;

	public constructor() {
		this.app = express();
		this.app.use(bodyParser.json());
		this.app.use(cookieParser());
		this.server = createServer(this.app);
	}

	public async registerRoutes() {
		const files = await fs.readdir(join(__dirname, 'routes'));
		const exports = (
			await Promise.all(
				files.map((f) => import(`./routes/${f.replace(/\.js/g, '')}`))
			)
		).map(
			(i: { default: typeof Route }) =>
				new (i.default.prototype.constructor.bind.apply(
					i.default.prototype.constructor,
					[null]
				))(this.app)
		);
		for (const r of exports) {
			const route = r as Route;
			const authCheck: RequestHandler = async (req, res, next) => {
				if (
					route.middleware.includes(Middleware.BEARER_AUTH) ||
					route.middleware.includes(Middleware.BOT_AUTH)
				) {
					const auth: string =
						req.cookies.authorization ?? req.headers.authorization;
					const match = auth?.match(/^(?<type>Bearer|Bot) (?<token>.+)/);
					if (!match) {
						res.status(401).send({
							success: false,
							error: 'Invalid or missing authorization header'
						});
						return;
					}
					if (
						match.groups!.type == 'Bearer' &&
						route.middleware.includes(Middleware.BEARER_AUTH)
					) {
						let user: APIUser;

						const response = await fetch(
							'https://discord.com/api/v10/users/@me',
							{
								headers: {
									authorization: `Bearer ${match.groups!.token}`
								}
							}
						);

						if (response.ok) {
							user = (await response.json()) as APIUser;
						} else {
							res.status(401).send({
								success: false,
								error: 'Invalid discord oauth token'
							});
							return;
						}

						if (!config.adminIDs.includes(user.id)) {
							res.status(401).send({
								success: false,
								error: 'Unauthorized'
							});
							return;
						}
						next();
					} else if (
						match.groups!.type == 'Bot' &&
						route.middleware.includes(Middleware.BOT_AUTH)
					) {
						let user: APIUser;

						const response = await fetch(
							'https://discord.com/api/v10/users/@me',
							{
								headers: {
									authorization: `Bot ${match.groups!.token}`
								}
							}
						);

						if (response.ok) {
							user = (await response.json()) as APIUser;
						} else {
							res.status(401).send({
								success: false,
								error: 'Invalid discord bot token'
							});
							return;
						}
					}
					next();
				}
				next();
			};
			if (typeof route.get == 'function')
				this.app.get(route.path, authCheck, route.get);
			if (typeof route.post == 'function')
				this.app.post(route.path, authCheck, route.post);
			if (typeof route.delete == 'function')
				this.app.delete(route.path, authCheck, route.delete);
		}
	}

	public startServer() {
		return this.server.listen(config.serverPort);
	}
}

export enum Middleware {
	BOT_AUTH,
	BEARER_AUTH
}

export abstract class Route {
	public abstract path: string;
	public get?(req: Request, res: Response): Promise<void>;
	public post?(req: Request, res: Response): Promise<void>;
	public delete?(req: Request, res: Response): Promise<void>;
	public middleware: Middleware[] = [];
	public app: Express;
	public constructor(app: Express) {
		this.app = app;
	}
}
