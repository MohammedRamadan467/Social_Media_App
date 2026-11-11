import z from "zod";
import { confirmEmail, login, requestForgotPasswordCode, resendConfirmEmail, signup, veriryForgotPassword } from "../authentication.validation";
import { createPost } from "../../post/post.validation";
// export interface ISignupDto{
//     username:string;
//     email:string;
//     password:string;
//     confirmPassword:string;
// }


export type SignupDto = z.infer<ReturnType<typeof signup>>
export type ConfirmEmailDto = z.infer<ReturnType<typeof confirmEmail>>['body']
export type ResendConfirmEmailDto = z.infer<ReturnType<typeof resendConfirmEmail>>['body']
export type RequestForgotPasswordDto = z.infer<ReturnType<typeof requestForgotPasswordCode>>['body']
export type LoginDto = z.infer<ReturnType<typeof login>>['body']
export type resetForgotPassword = z.infer<ReturnType<typeof veriryForgotPassword>>['body']
export type VeriryForgotPasswordDto = z.infer<ReturnType<typeof confirmEmail>>['body']
