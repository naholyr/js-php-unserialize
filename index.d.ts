declare module "php-unserialize" {
    function unserialize(data: string): any;
    function unserializeSession(data: string): any;
}