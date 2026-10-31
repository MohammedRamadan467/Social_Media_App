"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const send_email_1 = require("./send.email");
const enum_1 = require("../../enum");
const email_templates_1 = require("./template/email.templates");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("send-Email", async ({ subject = enum_1.EmailSubjectEnum.CONFIRM_EMAIL, recipients, data, }) => {
    try {
        await (0, send_email_1.sendEmail)({ ...recipients, subject, html: (0, email_templates_1.verifyEmailTemplate)({ subject, title: subject, code: data.code, }), });
    }
    catch (error) {
        console.log(error);
    }
});
