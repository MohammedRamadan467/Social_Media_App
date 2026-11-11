import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { responseFormatter, uploadMiddleware, validation } from "../../middleware";
import { fileValidation, localFielupload } from "../../common/utlis/multer";
import { StorageApproachEnum } from "../../common/enum";
import * as validators from './comment.validation'
import commentService from "./comment.service";
import { IComment, IResponse } from "../../common/interface";


const router = Router();


router.post("/:postId",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFielupload({
            storageApproach: StorageApproachEnum.MEMORY
        }).single("attachment"),
        customPath: "Post",
        validation: fileValidation.image,
        isRequired:false
    }),
    validation(validators.createComment),
    responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {

        const data = await commentService.createComment({
            ...req.validate.body,attachments: req.file? [req.file.path]: []},
            req.validate.params.postId ,
            req.user
            )

        return { status: 201, data }
    })
)


router.get("/:postId", authentication() , validation(validators.GetCommentsById), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IComment[]>> => {
        const data = await commentService.getAllComments(req.validate.params.postId , req.user)
        return { status: 200, data }

    }
))



router.get("/getCommentById/:commentId", authentication(),validation(validators.GetCommentById), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
        const data = await commentService.getComment(req.validate.params.commentId , req.user)
        return { status: 200, data  }

    }
))


router.patch("/:commentId",
     authentication(),
    uploadMiddleware({
        multerMiddleware: localFielupload({
            storageApproach: StorageApproachEnum.MEMORY
        }).single("attachment"),
        customPath: "Post",
        validation: fileValidation.image,
        isRequired:false
    }),
    validation(validators.UpdateComment), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
        const data = await commentService.updateComment(
            req.validate.params.commentId,
            {
            ...req.validate.body,attachments: req.file? [req.file.path]: []} ,
            req.user
        )
        return { status: 200, data  }

    }
))



router.delete("/:commentId", authentication(),validation(validators.GetCommentById), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
        const data = await commentService.deleteComment(req.validate.params.commentId , req.user)
        return { status: 200, data  }

    }
))




export default router;
