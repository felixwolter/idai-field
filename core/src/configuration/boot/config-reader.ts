export interface ConfigReader {
    exists(path: string): boolean;
    read(path: string): any;
}