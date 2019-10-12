import * as pino from 'pino';

const logger = pino();

export const formatEvent = (prefix, type) => `[${prefix.toUpperCase()}] ${type}`;
/**
 * @param {string} prefix
 * @param {string} type
 * @param {any} payload
 */
export const info = (prefix, type, payload = {}) => logger.info({ event: formatEvent(prefix, type), payload });

/**
 * @param {string} type
 * @param {any} payload
 */
export const warn = (prefix, type, payload = {}) => logger.warn({ event: formatEvent(prefix, type), payload });

/**
 * @param {string} type
 * @param {any} payload
 */
export const error = (prefix, type, payload = {}) => logger.error({ event: formatEvent(prefix, type), payload });
