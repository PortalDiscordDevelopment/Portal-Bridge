import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';

interface ModelAttributes {
	id: number;
	stack: string;
	user: string;
	guild: string;
	channel: string;
	message: string;
	bot: string;
}

export class Error extends BaseModel<
	ModelAttributes,
	Optional<ModelAttributes, 'id'>
> {
	declare id: number;
	declare stack: string;
	declare user: string;
	declare guild: string;
	declare channel: string;
	declare message: string;
	declare bot: string;
}
