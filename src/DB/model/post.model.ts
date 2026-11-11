import mongoose, { HydratedDocument } from "mongoose";
import { IPost } from "../../common/interface";

const postSchema = new mongoose.Schema<IPost>(
    {

        content: {
            type: String,
            minLength: 2,
            maxLength: 50000,
            required: function (this: IPost) {
                return !this.attachments?.length;
            },

        },
        attachments: [String],
        userId:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
           required:true
       }

    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        autoIndex: true,
        strict: true,
        strictQuery: true

    }
)


export const PostModel = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema)
export type HPost = HydratedDocument<IPost>