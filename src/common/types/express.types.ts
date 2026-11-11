import { HUser } from "../../DB/model";
import { JwtPayloadType } from "../security";

declare module "express-serve-static-core" {
    interface Request {
        validate:any,
        user:HUser,
        payload:JwtPayloadType
    }
}