import IFileRepository from './file-repository.types';
import { Permission } from './file-repository.types';
export default class FileRepository implements IFileRepository {
    hasAccess(path: string, permission: Permission): boolean;
    loadData(filename: string, extension: string): string | null;
    saveData(data: string, filename: string, extension: string, path?: string): void;
}
