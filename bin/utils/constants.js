export const SUPPORTED_FORMATS = [
    'typescript',
    'typescript-zod',
    'typescript-effect-schema'
];
export const HTTP_METHODS = [
    'GET',
    'POST',
    'PUT',
    'DELETE'
];
export const TYPESCRIPT_KEYWORDS = [
    'abstract', 'any', 'as', 'asserts', 'bigint', 'boolean', 'break', 'case',
    'catch', 'class', 'const', 'constructor', 'continue', 'debugger', 'declare',
    'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
    'finally', 'for', 'from', 'function', 'get', 'if', 'implements', 'import',
    'in', 'infer', 'instanceof', 'interface', 'is', 'keyof', 'let', 'module',
    'namespace', 'never', 'new', 'null', 'number', 'object', 'package',
    'private', 'protected', 'public', 'readonly', 'require', 'return', 'set',
    'static', 'string', 'super', 'switch', 'symbol', 'this', 'throw', 'true',
    'try', 'type', 'typeof', 'undefined', 'unique', 'unknown', 'var', 'void',
    'while', 'with', 'yield'
];
export const COMMON_ABBREVIATIONS = {
    'api': 'API',
    'xml': 'XML',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'url': 'URL',
    'uri': 'URI',
    'http': 'HTTP',
    'https': 'HTTPS',
    'id': 'ID',
    'uuid': 'UUID',
    'sql': 'SQL',
    'db': 'DB',
    'ui': 'UI',
    'ux': 'UX',
    'io': 'IO',
    'os': 'OS',
    'cpu': 'CPU',
    'gpu': 'GPU',
    'ram': 'RAM',
    'ssd': 'SSD',
    'hdd': 'HDD',
    'pdf': 'PDF',
    'zip': 'ZIP',
    'csv': 'CSV',
    'md5': 'MD5',
    'sha': 'SHA',
    'jwt': 'JWT',
    'oauth': 'OAuth',
    'cors': 'CORS',
    'csrf': 'CSRF',
    'xss': 'XSS'
};
export const DEFAULT_OPTIONS = {
    output: './types',
    runtime: false,
    format: 'typescript',
    parallel: 3,
    timeout: 30,
    retries: 2,
    quiet: false,
    watch: false
};
