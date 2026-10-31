import { NextFunction, Request, Response, Router } from 'express';
import { authentication, authorization } from '../../middleware/authentication.middleware';
import { RoleEnum, tokenTypeEnum } from '../../common/enum';
import { responseFormatter, validation } from '../../middleware';
import userService from "./user.service";
import { IResponse } from '../../common/interface';
import * as validators from './user.validation'


const router = Router();

router.get("/", authentication(), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.profile(req.user)
    return { status: 200, data }
  }
))


// router.patch
// ("/profile-image" ,
//       authentication() ,
//        uploadMiddleware({multerMiddleware: localFielupload({maxFileSize : 2 }).single("attachment") , customPath :"users" , validation : fileValidation.image }) ,

//          async (req,res,next)=>{
//      req.user.image = req.file.finalPath
//      await req.user.save()
//      return successResponse({res , data:{user : req.user}})
// })


router.patch("/", authentication(), authorization(RoleEnum.USER), responseFormatter(
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.updateProfile(req.body, req.user)

  }
))


router.post("/rotate-token", authentication(tokenTypeEnum.REFRESH), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`)
    return { status: 200, data }

  }
))


router.post("/follow/:userId", authentication(tokenTypeEnum.ACCESS), validation(validators.followUser), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.followUser(req.validate.params, req.user)
    return { status: 200, data }

  }
))


router.delete("/unfollow/:userId", authentication(tokenTypeEnum.ACCESS), validation(validators.followUser), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.UnFollowUser(req.validate.params, req.user)
    return { status: 200, data }

  }
))

router.get("/search", authentication(tokenTypeEnum.ACCESS), validation(validators.search), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.searchUsers(req.validate.query, req.user)
    return { status: 200, data }

  }
))


router.get("/suggestions", authentication(tokenTypeEnum.ACCESS), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.getUserSuggestions(req.user)
    return { status: 200, data }

  }
))


router.patch("/privacy", authentication(tokenTypeEnum.ACCESS),validation(validators.updatePrivacySchema), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.updatePrivacySettings(req.body, req.user)
    return { status: 200, data }

  }
))


router.get("/suggestions", authentication(tokenTypeEnum.ACCESS), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.getUserSuggestions(req.user)
    return { status: 200, data }

  }
))


router.post("/logout", authentication(), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.logout(req.payload, req.user, req.body)
    return { status: 200, data }
  }
))


router.delete("/deleteAccount", authentication(tokenTypeEnum.ACCESS), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.deleteAccount(req.user)
    return { status: 200, data }

  }
))


export default router;
