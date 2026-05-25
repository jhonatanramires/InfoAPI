import { Logger } from "tslog";

const isProduction = process.env.NODE_ENV === 'production';

const baseLogger = new Logger({
  type: "pretty",
  displayFilePath: "hidden", 
  displayFunctionName: false,
  minLevel: isProduction ? 3 : 0
});

['silly', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach((level) => {
  const originalMethod = baseLogger[level].bind(baseLogger);
  
  // Usamos 'function logWrapper' en lugar de una función flecha anónima
  baseLogger[level] = function logWrapper(...args) {
    const originalPrepare = Error.prepareStackTrace;
    const originalLimit = Error.stackTraceLimit;

    // Solo necesitamos el primer nivel de la pila
    Error.stackTraceLimit = 1;
    Error.prepareStackTrace = (_, stack) => stack;
    
    const dummy = {};
    
    // MAGIA V8: Al pasar 'logWrapper' como segundo parámetro, 
    // Node borra el logger de la pila. El índice 0 ahora es 100% tu función (ej: genDelay).
    Error.captureStackTrace(dummy, logWrapper);
    const callSites = dummy.stack;

    Error.prepareStackTrace = originalPrepare;
    Error.stackTraceLimit = originalLimit;

    let funcName = "Anónimo";
    
    if (callSites && callSites[0]) {
      const frame = callSites[0];
      // Extraemos el nombre nativamente
      funcName = frame.getFunctionName() || frame.getMethodName() || "Anónimo";
    }
    
    originalMethod(`${funcName}:`, ...args);
  };
});

export const logger = baseLogger;