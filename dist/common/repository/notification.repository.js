"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = exports.NotificationRepository = void 0;
const base_repository_1 = require("./base.repository");
const notification_model_1 = require("../../DB/model/notification.model");
class NotificationRepository extends base_repository_1.DatabaseRepository {
    constructor() {
        super(notification_model_1.NotificationModel);
    }
}
exports.NotificationRepository = NotificationRepository;
exports.notificationRepository = new NotificationRepository();
