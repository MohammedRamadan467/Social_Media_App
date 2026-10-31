import z from "zod";
import { LanguageEnum } from "../enum";

export interface IValidation{
    original:string;
    copy:string;
    data:any;
    ctx:z.RefinementCtx;
    lang?:LanguageEnum
}