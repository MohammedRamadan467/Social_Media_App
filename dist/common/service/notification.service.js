"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const firebase_admin_1 = require("firebase-admin");
const messaging_1 = require("firebase-admin/messaging");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const cache_service_1 = require("./cache.service");
class NotificationService {
    cacheService;
    client;
    constructor() {
        this.cacheService = cache_service_1.cacheService;
        this.client = (0, firebase_admin_1.initializeApp)({
            credential: (0, firebase_admin_1.cert)(JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)('./src/config/socialmediaapp-241a3-firebase-adminsdk-fbsvc-60a94eebcb.json'))))
        });
    }
    key({ userId }) {
        return `user:FCM:${userId.toString()}`;
    }
    async addFCM({ userId, FCM }) {
        return await this.cacheService.sAdd({
            key: this.key({ userId }),
            value: FCM
        });
    }
    async removeFCM({ userId, FCM }) {
        return await this.cacheService.sRem({
            key: this.key({ userId }),
            value: FCM
        });
    }
    async getFCMs({ userId }) {
        return await this.cacheService.sMembers({
            key: this.key({ userId })
        });
    }
    async hasFCMs({ userId }) {
        return await this.cacheService.sCard({
            key: this.key({ userId })
        });
    }
    async removeFCMUser({ userId }) {
        return await this.cacheService.del({
            key: this.key({ userId })
        });
    }
    async sendNotification({ token, notification }) {
        return await (0, messaging_1.getMessaging)(this.client).send({
            token,
            notification
        });
    }
    async sendNotifications({ tokens, notification }) {
        return await Promise.allSettled(tokens.map(token => this.sendNotification({ token, notification })));
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
