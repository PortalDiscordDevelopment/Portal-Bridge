import bodyParser from 'body-parser';
import express, { type Express } from 'express';
import { promises as fs } from 'fs';
import { createServer, Server } from 'http';
import { join } from 'path';
import * as config from './config';

export class HttpHandler {
	private app: Express;
	public server: Server;

	public constructor() {
		this.app = express();
		this.app.use(bodyParser.json());
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
		for (const route of exports) {
			if (route.get) this.app.get(route.path, route.get);
			if (route.post) this.app.post(route.path, route.post);
			if (route.delete) this.app.delete(route.path, route.delete);
		}
	}

	public startServer() {
		return this.server.listen(config.serverPort);
	}
}

export abstract class Route {
	public abstract path: string;
	public app: Express;
	public constructor(app: Express) {
		this.app = app;
	}
}
