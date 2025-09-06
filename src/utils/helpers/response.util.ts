import { Response as ExpressResponse } from "express";

export default class Response {
  private code: number;
  private message: string | string[];
  private data: any;
  res: ExpressResponse<any, Record<string, any>>;

  constructor(code: number, res: ExpressResponse, message?: any, data?: any) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.res = res;
    this.sendResponse(res);
  }

  private sendResponse(res: ExpressResponse) {
    if (this.data) {
      return res.status(this.code).send({
        data: this.data,
      });
    } else {
      return res.status(this.code).send({
        message: this.message,
      });
    }
  }
}
