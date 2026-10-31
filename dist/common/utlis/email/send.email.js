"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEmaiTrialsKey = exports.userEmailKey = void 0;
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_js_1 = require("../../../config.js");
const domain_exception_1 = require("../../exception/domain.exception");
const userEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}::OTP`;
};
exports.userEmailKey = userEmailKey;
const userEmaiTrialsKey = ({ email, subject }) => {
    return `${(0, exports.userEmailKey)({ email, subject })}::Trials`;
};
exports.userEmaiTrialsKey = userEmaiTrialsKey;
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_js_1.APP_EMAIL,
        pass: config_js_1.APP_PASSWORD,
    },
});
async function sendEmail({ to, cc, bcc, subject, text, html, attachments = [], }) {
    try {
        if (!to?.length && !cc?.length && !bcc?.length) {
            throw new domain_exception_1.BadRequestException("invalid recipient");
        }
        if (!html?.length && !text?.length && !attachments?.length) {
            throw new domain_exception_1.BadRequestException("invalid email content");
        }
        const info = await transporter.sendMail({
            from: `"Route Academy" <${config_js_1.APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments: [],
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    }
    catch (err) {
        console.error("Error while sending mail:", err);
    }
}
