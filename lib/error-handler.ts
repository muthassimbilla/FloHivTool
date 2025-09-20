export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500)
  }

  return new AppError("An unexpected error occurred", 500)
}

export const logError = (error: AppError, context?: string) => {
  const errorInfo = {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    isOperational: error.isOperational,
  }

  if (process.env.NODE_ENV === "production") {
    // In production, you might want to send to external logging service
    console.error("Production Error:", JSON.stringify(errorInfo, null, 2))
  } else {
    console.error("Development Error:", errorInfo)
  }
}
