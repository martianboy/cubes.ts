import { pick } from './utils';
import { AggregateResult } from './aggregate-result';
import { Cell } from './cell';
import { Server } from './server';
import { Cube } from './cube';

export class Browser {
    constructor(public server: Server, public cube: any) {}

    full_cube(): Cell {
        return new Cell(this.cube, []);
    }

    aggregate(args: Object): Promise<AggregateResult> {
        return this.server.query('aggregate', this.cube.name, pick(args || {}, [
            'cut', 'measure', 'drilldown', 'split', 'order', 'page', 'pagesize'
        ]), {});
    }
}
