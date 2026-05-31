type ErrorObject = {
  errorMessage: string;
};

const createErrorObject = (message: string): ErrorObject => {
  const errorObj = {
    errorMessage: message,
  };
  return errorObj;
};

export default createErrorObject;
