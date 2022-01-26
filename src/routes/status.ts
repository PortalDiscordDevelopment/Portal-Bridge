import { Request, Response } from 'express';
import { WebsocketHandler } from '../ws';
import { Middleware, Route } from '../app';

export default class Status extends Route {
	public override path = '/status/:bot';
	public override middleware = [Middleware.BEARER_AUTH, Middleware.BOT_AUTH];
	public async get(req: Request, res: Response) {
		const status = [...WebsocketHandler.websocket.sockets.sockets.values()].find(
			(c) => c.data.bot == req.params.bot
		);
		res.send({
			success: true,
			online: !!status,
			status: status
				? {
					name: status.data.bot,
					nodeVer: status.data.nodeVer,
					userAgent: status.data.userAgent,
					uptime: new Date().getTime() - status.data.connectedAt!.getTime(),
					connectedAt: status.data.connectedAt
				}
				: null
		});
	}
}
