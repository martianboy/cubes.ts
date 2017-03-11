import { find } from './utils';
import { Level } from './level';
import { ICellKey, ICellRead, ICellValue } from './cell';

interface Dimension {
    level(name: string): Level;
}

export const HIERARCHY_PREFIX_CHAR = '@';

export interface IHierarchyProps {
    name: string;
    label?: string;
    description?: string;
    levels: string[];
    info?: any;
}

export class Hierarchy {
    name: string;
    label: string;
    description: string;
    levels: Level[];
    info: any;

    constructor(attrs: IHierarchyProps, dimension: Dimension) {
        this.name = attrs.name;
        this.label = attrs.label;
        this.description = attrs.description;
        this.info = attrs.info;

        const level_names = attrs.levels || [];
        this.levels = level_names.map(name => dimension.level(name));
    }

    toString(): string {
        return HIERARCHY_PREFIX_CHAR + this.name;
    }

    display_label(): string {
        return this.label || this.name;
    }

    level_index(level: Level): number {
        return this.levels.indexOf(find(this.levels, lvl => lvl.name === level.name));
    }

    readCell(cell: ICellValue, level_limit: Level | undefined | null): ICellRead[] {
        const result: ICellRead[] = [];

        for (const level of this.levels) {
            const info = level.readCell(cell);
            if (info !== null) result.push(info);

            if (level_limit && level_limit.name === level.name) break;
        }

        return result;
    }
}
