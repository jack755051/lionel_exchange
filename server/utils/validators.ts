const isValidDate = (v: unknown): v is string => /^\d{4}-\d{2}-\d{2}$/.test(String(v))

export const Validators = { isValidDate } as const
