import { Cube, ICubeProps } from './cube';
import serializer from './query-serializer';

interface ICubeListMember {
    category: any;
    info: Object | null;
    label: string;
    name: string;
}

interface ICubesServerInfo {
    json_record_limit: number;
    cubes_version: string;
    timezone: string;
    first_weekday: number;
    api_version: string;
    authentication: Object;
}

function getJSON(url): Promise<any> {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(reason => { throw reason; })
    .then(response => response.json());
}

export class Server {
    _cube_list: ICubeListMember[];
    _cubes: { [id: string]: Cube };

    server_version: string;
    cubes_version: string;
    api_version: string;
    info: any;

    constructor(protected baseUrl: string) {
        this._cube_list = [];
        this._cubes = {};
    }

    query(query: string, cube_name: string, args: any, options: any): Promise<any> {
        const query_args = serializer(args);
        let url = `${this.baseUrl}cube/${cube_name}/${query}`;
        if (query_args.length > 0)
            url += '?' + query_args;

        return getJSON(url);
    }

    connect(): Promise<ICubeListMember[]> {
        const cubeInfoPromise: Promise<ICubesServerInfo> = getJSON(this.baseUrl + '/info');

        return cubeInfoPromise.then(
            info => {
                this.server_version = info.cubes_version;
                this.cubes_version = info.cubes_version;
                this.api_version = info.api_version;
                this.info = info;
                return this.load_cube_list();
            },

            err => { throw err; }
        );
    }

    load_cube_list(): Promise<ICubeListMember[]> {
        const cubesListPromise: Promise<ICubeListMember[]> = getJSON(this.baseUrl + '/cubes');
        return cubesListPromise.then(
            cubes_list => {
                this._cube_list = cubes_list;
                return cubes_list;
            },

            err => { throw err; }
        );
    }

    get_cube(name: string): Promise<Cube> {
        if (name in this._cubes)
            return Promise.resolve(this._cubes[name]);

        const cubePromise: Promise<ICubeProps> =
            getJSON(this.baseUrl + '/cube/' + encodeURI(name) + '/model');

        return cubePromise.then(
            cube_props => {
                this._cubes[name] = new Cube(cube_props);
                return this._cubes[name];
            },

            err => { throw err; }
        );
    }
}

export default Server;
