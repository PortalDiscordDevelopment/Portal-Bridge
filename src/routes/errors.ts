import { Request, Response } from 'express';
import { Error } from '../models/Error';
import { Route } from '../app';

export default class Index extends Route {
	public override path = '/errors/:bot';
	public async get(req: Request, res: Response) {
		res.send({
			success: true,
			errors: await Error.findAll({
				where: {
					bot: req.params.bot
				},
				attributes: {
					include: ['id']
				}
			}).then((es) => es.map((e) => e.id))
		});
	}
	public async post(req: Request, res: Response) {
		const bot = req.params.bot,
			user = req.body.user,
			guild = req.body.guild,
			channel = req.body.channel,
			message = req.body.message,
			stack = req.body.stack;
		if (
			!(
				typeof user == 'string' &&
				typeof guild == 'string' &&
				typeof channel == 'string' &&
				typeof message == 'string' &&
				typeof stack == 'string'
			)
		) {
			res.status(400);
			res.send({
				success: false,
				error: 'One or more body values were missing or invalid.'
			});
			return;
		}
		const errorModel = Error.build({
			user,
			guild,
			channel,
			message,
			stack,
			bot
		});
		await errorModel.save();
		res.send({
			success: true,
			id: errorModel.id
		});
	}
}
