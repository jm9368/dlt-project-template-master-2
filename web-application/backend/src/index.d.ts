// Global typescript definitions

export interface RequestLogContext {
    /**
     * Identifier to co-relate the logs
     */
    id: string;

    /**
     * Levels to check if they are enabled
     */
    levels: {
        error: boolean,
        warning: boolean,
        info: boolean,
        debug: boolean,
        trace: boolean,
    },

    /**
     * Logs an error message
     * @param msg The message
     * @param metadata The metadata
     */
    error(msg: string | Error, metadata?: {[key: string]: any});

    /**
     * Logs a warning message
     * @param msg The warning message
     * @param metadata The metadata
     */
    warning(msg: string, metadata?: {[key: string]: any});

    /**
     * Logs an info message
     * @param msg The warning message
     * @param metadata The metadata
     */
    info(msg: string, metadata?: {[key: string]: any});

    /**
     * Logs a debug message
     * @param msg The debug message
     * @param metadata The metadata
     */
    debug(msg: string, metadata?: {[key: string]: any});

    /**
     * Logs a debug message
     * @param msg The debug message
     * @param metadata The metadata
     */
    trace(msg: string, metadata?: {[key: string]: any});
}

declare global {
    namespace Express {
        export interface Request {
            logger: RequestLogContext;
        }
    }
}
