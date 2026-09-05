export const createMockResponse = () => {
  const res = {
    statusCode: undefined,
    payload: undefined,
    headersSent: false,
    cookies: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
    cookie(name, value, options) {
      this.cookies[name] = { value, options };
      return this;
    },
    clearCookie(name, options) {
      delete this.cookies[name];
      return this;
    },
  };

  return res;
};

export const nextTick = () => new Promise((resolve) => setImmediate(resolve));