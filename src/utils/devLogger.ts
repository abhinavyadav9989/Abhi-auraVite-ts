export const devLogger = {
  info: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.error(message, ...args);
    }
  }
};

