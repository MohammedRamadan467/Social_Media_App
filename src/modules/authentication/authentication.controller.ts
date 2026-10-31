import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import authenticationService from "./authentication.service";
import { responseFormatter, validation } from "../../middleware";
import * as validators from './authentication.validation'
import { IResponse, IUser } from "../../common/interface";
const router = Router({ strict: true, caseSensitive: true })



router.post("/signup", validation(validators.signup), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IUser>> => {
        const data = await authenticationService.signup(req.validate.body)
        return { status: 201, data }
    }
))


router.post("/signup-with-gmail", responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<{ access_token: string; refresh_token: string }>> => {
        const { status, data } = await authenticationService.signupWithGmail(req.body, `${req.protocol}://${req.host}`)
        return { status, data }
    }
))



router.patch("/confirm-email", validation(validators.confirmEmail), responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        await authenticationService.confirmEmail(req.body)
    }))



router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail), responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        await authenticationService.resendConfirmEmail(req.body)
    }))


router.post("/login", validation(validators.login), responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await authenticationService.login(req.validate.body, `${req.protocol}://${req.host}`)
        return { status: 200, data }
    }))

router.post("/request-forgot-password-code", validation(validators.requestForgotPasswordCode), responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await authenticationService.requestForgotPasswordCode(req.body)
    }
))

router.post("/verify-forgot-password", validation(validators.confirmEmail), responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await authenticationService.verifyForgotPasswordCode(req.body)
    }
))


router.patch("/reset-forgot-password", validation(validators.veriryForgotPassword), responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await authenticationService.resetForgotPassword(req.body)
    }
))






export default router;