import { Request, Response } from 'express';
import { WebsocketHandler } from '../ws';
import { Middleware, Route } from '../app';

export default class Status extends Route {
	public override path = '/status/:bot';
	public override middleware = [Middleware.BEARER_AUTH, Middleware.BOT_AUTH];
	public async get(req: Request, res: Response) {
		const status = [
			...WebsocketHandler.websocket.sockets.sockets.values()
		].find((c) => c.data.name == req.params.bot);
		res.send({
			success: true,
			online: !!status,
			status: status
				? {
						name: status.data.name,
						platform: status.data.platform,
						platformVersion: status.data.platformVersion,
						uptime: new Date().getTime() - status.data.connectedAt!.getTime(),
						connectedAt: status.data.connectedAt
				  }
				: null
		});
	}
}
