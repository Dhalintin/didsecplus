"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Response {
    constructor(code, res, message, data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.res = res;
        this.sendResponse(res);
    }
    sendResponse(res) {
        if (this.data) {
            return res.status(this.code).send({
                data: this.data,
            });
        }
        else {
            return res.status(this.code).send({
                message: this.message,
            });
        }
    }
}
exports.default = Response;
