const success = (code: number, message: string, data?: any) => {
  return { code, status: "success", message, data: data === undefined ? undefined : data, errors: null };
};

const error = (code: number, message: string, errorMessages?: string | string[]) => {
  return {
    code,
    status: "error",
    message,
    errorMessages: errorMessages || "An unexpected error occurred !",
  };
};

export default { success, error };
