import express, { type Request, type Response, type Express } from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';

export class HttpHandler {
	private app: Express;

	public constructor() {
		this.app = express();
	}

	public async registerRoutes() {
		const files = await fs.readdir(join(__dirname, 'routes'));
		const exports = (
			await Promise.all(
				files.map((f) => import(`./routes/${f.replace(/\.js/g, '')}`))
			)
		).map((i: { default: typeof Route }) => new (i.default.prototype.constructor.bind.apply(i.default.prototype.constructor, [null]))());
		for (const route of exports) {
			this.app.get(route.path, route.get)
			this.app.post(route.path, route.get)
		}
	}

	public startServer() {
		return this.app.listen(3000);
	}
}

export abstract class Route {
	public abstract path: string;
	public async get(req: Request, res: Response) {}
}
