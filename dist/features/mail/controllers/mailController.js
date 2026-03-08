"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const emailService_1 = require("../../../utils/emailService");
const mail_validation_1 = require("../../../validations/mail.validation");
class MailController {
    send(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = mail_validation_1.mailSchema.validate(req.body);
                if (error) {
                    new response_util_1.default(400, res, error.details[0].message);
                    return;
                }
                const data = yield (0, emailService_1.mailMessage)({
                    email: req.body.email,
                    sender: req.body.name,
                    message: req.body.message,
                });
                res
                    .status(200)
                    .json({ success: true, message: "Message sent successfully" });
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
}
exports.MailController = MailController;
