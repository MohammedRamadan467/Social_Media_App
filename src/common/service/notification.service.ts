import { App, cert, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cacheService, CacheService } from "./cache.service";
import mongoose from "mongoose";

type UserIdType = mongoose.Types.ObjectId | string
export class NotificationService {
    
    private cacheService : CacheService
    private client: App
    constructor(){
        this.cacheService = cacheService
        this.client = initializeApp({
            credential:cert(JSON.parse(readFileSync(resolve('./src/config/socialmediaapp-241a3-firebase-adminsdk-fbsvc-60a94eebcb.json'))as unknown as string))
        })
    }


    key({ userId }: { userId: UserIdType }) {
    return `user:FCM:${userId.toString()}`;
}

async addFCM({ userId, FCM }: { userId: UserIdType, FCM: string }) {
    return await this.cacheService.sAdd({
        key: this.key({ userId }),
        value: FCM
    });
}

async removeFCM({ userId, FCM }: { userId: UserIdType, FCM: string }) {
    return await this.cacheService.sRem({
        key: this.key({ userId }),
        value: FCM
    });
}

async getFCMs({ userId }: { userId: UserIdType }) {
    return await this.cacheService.sMembers({
        key: this.key({ userId })
    });
}

async hasFCMs({ userId }: { userId: UserIdType }) {
    return await this.cacheService.sCard({
        key: this.key({ userId })
    });
}

async removeFCMUser({ userId }: { userId: UserIdType }) {
    return await this.cacheService.del({
        key: this.key({ userId })
    });
}

    
    async sendNotification({
        token,
        notification
    }:{
        token:string,
        notification:{title:string , body:string , imageUrl?:string}
    }){
        return await getMessaging(this.client).send({
            token,
            notification
        })
    }


    async sendNotifications({
        tokens,
        notification
    }:{
        tokens:string[],
        notification:{title:string , body:string , imageUrl?:string}
    }){
        return await Promise.allSettled(tokens.map(token => this.sendNotification({token , notification})))
    }
}


export const notificationService = new NotificationService()