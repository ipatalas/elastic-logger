import * as bunyan from 'bunyan';

declare function createLogger(project: string, appName?:string): bunyan;

export = createLogger;