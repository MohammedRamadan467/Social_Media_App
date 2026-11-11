import mongoose, { HydratedDocument } from "mongoose";
import { IComment } from "../../common/interface";

const commentSchema = new mongoose.Schema<IComment>(
    {

        content: {
            type: String,
            minLength: 2,
            maxLength: 50000,
            required: function (this: IComment) {
                return !this.attachments?.length;
            },

        },
        attachments: [String],
        userId:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
           required:true
       },
        postId:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"Post",
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


export const CommentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema)
export type HComment = HydratedDocument<IComment>