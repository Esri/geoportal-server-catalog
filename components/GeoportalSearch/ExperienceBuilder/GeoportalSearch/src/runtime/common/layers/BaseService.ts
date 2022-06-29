export default abstract class BaseService {
    // extend this for any new Service type that will be supported
    abstract getLayersToAdd(url: string): Promise<any>;

}