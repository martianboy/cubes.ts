import { Cube, DimensionParts } from './cube';
import { cut_from_aggregate_result, Cut, ICellProps } from './cuts';
import { Cell, ICellKey, ICellValue } from './cell';

type Summary = { [id: string]: number };
type AggregateResultLevel = { [id: string]: string[] };

interface IAggregateResultJson {
    summary: Summary;
    remainder?: any;
    cells: ICellValue[];
    total_cell_count: number;
    aggregates: string[];
    cell: ICellProps[];
    levels: AggregateResultLevel;
    attributes: string[];
    has_split: boolean;
}

export class AggregateResult {
    summary: Summary;
    remainder?: Object;
    cells: ICellValue[];
    total_cell_count: number;
    aggregates: string[];
    cuts: Cut[];
    cell: Cell;
    levels: AggregateResultLevel;
    attributes: string[];
    has_split: boolean;

    constructor(cube: Cube, props: IAggregateResultJson) {
        this.cell = new Cell(cube, props.cell);
        this.summary = props.summary;
        this.cells = props.cells;
        this.total_cell_count = props.total_cell_count;
        this.aggregates = props.aggregates;
        this.levels = props.levels;
        this.attributes = props.attributes;
        this.has_split = props.has_split;
    }
}