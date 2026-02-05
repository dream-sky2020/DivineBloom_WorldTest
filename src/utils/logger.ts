import { createConsola } from "consola";

const logger = createConsola({
  // In production, only show warnings and errors. 
  // In development, show everything (level 4 includes debug).
  level: import.meta.env.PROD ? 3 : 5,
  defaults: {
    // You can add default tags here if needed
    tag: 'GAME'
  }
});

/**
 * Creates a scoped logger for a specific module/system
 * @param {string} tag - The tag to display (e.g., 'BATTLE', 'ECS')
 */
export const createLogger = (tag: string) => {
  return logger.withTag(tag);
}

export default logger;
