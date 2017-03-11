import { find } from './utils';
import { Path } from './paths';
import {
    Cut,
    ICellProps,
    cut_from_aggregate_result,
    cuts_from_string,
    CUT_STRING_SEPARATOR_CHAR
} from './cuts';
import { Cube } from './cube';

export type ICellKey = string | number;

export interface ICellRead {
    key: ICellKey;
    label: string;
    orderValue: ICellKey;
    info: Object;
}

export interface ICellValue {
    [id: string]: string | number;
}

export class Cell {
    cube: Cube;
    cuts: Cut[];

    constructor(cube: Cube, cuts: ICellProps[]) {
        this.cube = cube;
        this.cuts = cuts.map(prop => cut_from_aggregate_result(cube, prop));
    }

    slice(new_cut: Cut): Cell {
        const cuts: ICellProps[] = [];
        let new_cut_pushed = false;

        for (const cut of this.cuts) {
            if (cut.dimension === new_cut.dimension) {
                cuts.push(new_cut.toCellProps());
                new_cut_pushed = true;
            } else {
                cuts.push(cut.toCellProps());
            }
        }

        if (!new_cut_pushed) {
            cuts.push(new_cut.toCellProps());
        }

        return new Cell(this.cube, cuts);
    }

    cut_for_dimension(name: string): Cut | undefined {
        return find(this.cuts, cut => cut.dimension.name === name);
    }

    toString(): string {
        return (this.cuts || []).map(cut => cut.toString())
            .join(CUT_STRING_SEPARATOR_CHAR);
    }
}

export function cell_from_string(cube: Cube, cut_param_value: string): Cell {
    return new Cell(cube, cuts_from_string(cube, cut_param_value).map(cut => cut.toCellProps()));
}