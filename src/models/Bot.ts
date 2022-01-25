import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';

interface ModelAttributes {
	name: string;
	guildCount: number;
}

export class Bot extends BaseModel<
	ModelAttributes,
	Optional<ModelAttributes, 'guildCount'>
> {
	declare name: string;
	declare guildCount: number;
}
