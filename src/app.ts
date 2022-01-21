import express, { type Request, type Response, type Express } from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';

export enum Method {
	GET,
	POST
}

export class HttpHandler {
	private app: Express;

	public constructor() {
		this.app = express();
	}

	public async registerRoutes() {
		const files = await fs.readdir(join(__dirname, 'routes'));
		console.log(files);
	}

	public startServer() {
		return this.app.listen(3000);
	}
}

export abstract class Route {
	public abstract path: string;

	public async [Method.GET](req: Request, res: Response) {}
	public async [Method.POST](req: Request, res: Response) {}
}
