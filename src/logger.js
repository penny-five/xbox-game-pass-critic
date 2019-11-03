import * as pino from 'pino';

const logger = pino();

/**
 *
 * @param {string} tag
 * @param {string} message
 * @param {any} payload
 */
export const formatEvent = (tag, message, payload) => ({
  tag: tag.toUpperCase(),
  message,
  payload
});

/**
 * @param {string} tag
 * @param {string} message
 * @param {any} payload
 */
export const info = (tag, message, payload = {}) => logger.info(formatEvent(tag, message, payload));

/**
 * @param {string} tag
 * @param {string} message
 * @param {any} payload
 */
export const warn = (tag, message, payload = {}) => logger.warn(formatEvent(tag, message, payload));
/**
 * @param {string} tag
 * @param {string} message
 * @param {any} payload
 */
export const error = (tag, message, payload = {}) => logger.error(formatEvent(tag, message, payload));
