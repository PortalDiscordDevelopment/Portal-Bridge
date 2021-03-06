import { Request, Response } from 'express';
import { Error } from '../models/Error';
import { Middleware, Route } from '../app';

export default class ErrorRoute extends Route {
	public override path = '/errors/:bot/:id';
	public override middleware = [Middleware.BEARER_AUTH, Middleware.BOT_AUTH];
	public async get(req: Request, res: Response) {
		const bot = req.params.bot,
			id = req.params.id,
			error = await Error.findOne({
				where: {
					bot,
					id
				}
			});
		if (!error) {
			res.status(404);
			res.send({
				success: false,
				error: 'Error not found'
			});
			return;
		}
		res.send({
			success: true,
			error
		});
	}
}
