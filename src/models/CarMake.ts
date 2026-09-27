import {Document, model, Schema} from 'mongoose';

export interface ICarModel {
    name: string;
}

export interface ICarMake extends Document {
    name: string;
    models: ICarModel[];
}

const carMakeSchema = new Schema<ICarMake>({
    name: {type: String, required: true, unique: true, trim: true},
    models: {
        type: [{name: {type: String, required: true, trim: true}}],
        default: [],
    },
});

export const CarMake = model<ICarMake>('CarMake', carMakeSchema);
