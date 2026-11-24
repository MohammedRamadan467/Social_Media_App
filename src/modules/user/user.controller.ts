import { NextFunction, Request, Response, Router } from 'express';
import { authentication, authorization } from '../../middleware/authentication.middleware';
import { RoleEnum, StorageApproachEnum, tokenTypeEnum } from '../../common/enum';
import { responseFormatter, uploadMiddleware, validation } from '../../middleware';
import userService from "./user.service";
import { IFriendRequest, IResponse, IUser } from '../../common/interface';
import * as validators from './user.validation'
import { getIssuer } from '../../common/utlis';
import { fileValidation, localFielupload } from '../../common/utlis/multer';
import { IFile } from '../../common/types';
import { AcceptFriendRequestDto, BlockFriendRequestDto, UnFriendRequestDto } from './dto/user.dto';


const router = Router();

router.get("/", authentication(), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.profile(req.user)
    return { status: 200, data }
  }
))

// router.patch ("/profile-image" ,
//   authentication()  ,
//      responseFormatter(
//          async (req: Request, res: Response, next: NextFunction):Promise<IResponse<string>>=>{
//          const url = await userService.profileImage(req.body, req.user)
//         return {data  : url}
// }))

router.patch ("/profile-image" ,
  authentication() , 
  uploadMiddleware({
  multerMiddleware: localFielupload({}).single("attachment") ,
  customPath :"User" , 
  validation : fileValidation.image 

    }) ,
     responseFormatter(
         async (req: Request, res: Response, next: NextFunction):Promise<IResponse<IUser>>=>{
         const account = await userService.profileImage(req.file as IFile, req.user)
        return {data  : account}
}))


router.patch ("/profile-cover-image" ,
  authentication() , 
  uploadMiddleware({
  multerMiddleware: localFielupload({}).array("attachments" , 3) ,
  customPath :"User" , 
  validation : fileValidation.image 

    }) ,
     responseFormatter(
         async (req: Request, res: Response, next: NextFunction):Promise<IResponse<IUser>>=>{
         const account = await userService.profileCoverImages(req.files as IFile[] , req.user)
        return {data  : account}
}))

router.patch("/", authentication(), authorization(RoleEnum.USER), responseFormatter(
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.updateProfile(req.body, req.user)

  }
))


router.post("/rotate-token", authentication(tokenTypeEnum.REFRESH), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
    const data = await userService.rotateToken(req.payload, req.user, getIssuer(req))
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



router.post("/send-friend-request", authentication(),validation(validators.sendFriendRequest), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IFriendRequest>> => {
    const request = await userService.sendFriendRequest(req.body, req.user)
    return { status: 200, data: request as unknown as IFriendRequest }

  }
))

router.patch("/accept-friend-request/:friendRequestId", authentication(),validation(validators.acceptFriendRequest), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IFriendRequest>> => {
    const request = await userService.acceptFriendRequest(req.params as AcceptFriendRequestDto, req.user)
    return { status: 200, data: request as unknown as IFriendRequest }

  }
))

router.patch("/cancel-friend-request/:friendRequestId", authentication(),validation(validators.acceptFriendRequest), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IFriendRequest>> => {
    const request = await userService.cancelFriendRequest(req.params as AcceptFriendRequestDto, req.user)
    return { status: 200, data: request as unknown as IFriendRequest }

  }
))

router.patch("/un-friend/:friendId", authentication(),validation(validators.unFriend), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IFriendRequest>> => {
    const request = await userService.unFriend(req.params as UnFriendRequestDto, req.user)
    return { status: 200, data: request as unknown as IFriendRequest }

  }
))


router.patch("/block-friend/:friendId", authentication(),validation(validators.blockFriend), responseFormatter(
  async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IFriendRequest>> => {
    const request = await userService.blockFriend(req.params as BlockFriendRequestDto, req.user)
    return { status: 200, data: request as unknown as IFriendRequest }

  }
))
export default router;
