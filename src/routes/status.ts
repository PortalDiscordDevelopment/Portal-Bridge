import { Request, Response } from 'express';
import { WebsocketHandler } from '../ws';
import { Route } from '../app';

export default class Status extends Route {
	public override path = '/status/:bot';
	public async get(req: Request, res: Response) {
        const status = WebsocketHandler.connected.find(c => c.name == req.params.bot)
		res.send({
            success: true,
            online: !!status,
            status: WebsocketHandler.connected.find(c => c.name == req.params.bot) ?? null
        })
	}
}