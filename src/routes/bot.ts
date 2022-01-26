import { Request, Response } from 'express';
import { Middleware, Route } from '../app';
import { Bot } from '../models/Bot';

export default class ErrorRoute extends Route {
	public override path = '/bot/:bot';
	public override middleware = [Middleware.BEARER_AUTH, Middleware.BOT_AUTH];
	public async get(req: Request, res: Response) {
		const botModel = await Bot.findByPk(req.params.bot);
		if (!botModel) {
			res.status(404);
			res.send({
				success: false,
				error: 'Invalid bot'
			});
			return;
		}
		res.send({
			success: true,
			data: botModel.toJSON()
		});
	}
}
