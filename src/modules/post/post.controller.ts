import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import * as validators from './post.validation'
import { responseFormatter, uploadMiddleware, validation } from "../../middleware";
import { IPost, IResponse } from "../../common/interface";
import postService from "./post.service";
import { fileValidation, localFielupload } from "../../common/utlis/multer";
import { StorageApproachEnum } from "../../common/enum";


const router = Router();


router.post("/",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFielupload({
            storageApproach: StorageApproachEnum.MEMORY
        }).array("attachment", 3),
        customPath: "Post",
        validation: fileValidation.image
    }),
    validation(validators.createPost),
    responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IPost>> => {

        const data = await postService.createPost({
            ...req.validate.body,
            attachments: Array.isArray(req.files)
                ? req.files.map(file => file.path)
                : []
        }, req.user)

        return { status: 201, data }
    })
)


router.get("/", authentication(), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IPost[]>> => {
        const data = await postService.getAllPost(req.user)
        return { status: 200, data }

    }
))


router.get("/:postId", authentication(),validation(validators.GetPostById), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
        const data = await postService.getPost(req.validate.params.postId , req.user)
        return { status: 200, data  }

    }
))

router.patch("/:postId",
     authentication(),
    uploadMiddleware({
        multerMiddleware: localFielupload({
            storageApproach: StorageApproachEnum.MEMORY
        }).array("attachment" , 3),
        customPath: "Post",
        validation: fileValidation.image,
        isRequired:false
    }),
    validation(validators.UpdatePost), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
        const data = await postService.updatePost(
            req.validate.params.postId,
            {
            ...req.validate.body,                     
            attachments: Array.isArray(req.files)? req.files.map(file => file.path) : []
        } ,
            req.user
        )
        return { status: 200, data  }

    }
))



router.delete("/:postId", authentication(),validation(validators.GetPostById), responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
        const data = await postService.deletePost(req.validate.params.postId , req.user)
        return { status: 200, data  }

    }
))




export default router;
