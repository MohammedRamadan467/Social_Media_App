import mongoose, { HydratedDocument } from "mongoose";
import { IPost, IReaction } from "../../common/interface";
import { PrivacyEnum, ReactionEnum } from "../../common/enum";

const reactionSchema = new mongoose.Schema<IReaction>(
    {
        createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User" , required:true},
        reaction:{type:Number , enum:ReactionEnum , default:ReactionEnum.LIKE}
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

const postSchema = new mongoose.Schema<IPost>(
    {
        folderId:{type:Number , required:true},
        content: {
            type: String,
            minLength: 2,
            maxLength: 500000,
            required: function (this) {
                return !this.attachments?.length;
            },

        },
        attachments: [String],
        createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User" , required:true},
        mentions:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
        sharedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
        allowShare:{type:Boolean , default:true},
        reaction:[reactionSchema],
        privacy:{type:Number , enum:PrivacyEnum , default:PrivacyEnum.PUBLIC}



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