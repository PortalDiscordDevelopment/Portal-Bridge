import { Request, Response } from 'express';
import { Route } from '../app';

export default class Index extends Route {
	public override path = '/';
	public async get(req: Request, res: Response) {
		res.send('lmao theres nothing here');
	}
}
