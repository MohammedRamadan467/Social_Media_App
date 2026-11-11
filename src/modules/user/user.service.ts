import jwt from "jsonwebtoken";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exception";
import { followRepository, FollowRepository, userRepository, UserRepository } from "../../common/repository";
import { CacheService, cacheService, cloudService, CloudService} from "../../common/service";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config";
import { IUser } from "../../common/interface";
import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, LogoutEnum } from "../../common/enum";
import { IFollow } from "../../common/interface/follow.interface";
import { decryption, encryption, JwtPayloadType, tokenService, TokenService } from "../../common/security";
import { HUser } from "../../DB/model";
import { toObjectId } from "../../common/utlis";
import { IFile } from "../../common/types";


class UserService {
  private readonly userRepository: UserRepository
  private readonly cacheService: CacheService
  private readonly followRepository: FollowRepository
  private readonly tokenService : TokenService
  private readonly cloudService : CloudService

  constructor() {
    this.cacheService = cacheService
    this.userRepository = userRepository
    this.followRepository = followRepository
    this.tokenService = tokenService
    this.cloudService = cloudService
    
  }


   async profileImage(file:IFile , user:HUser):Promise<string>{
    const key = await this.cloudService.uploadAsset({
      file,
      folder:`User/${user._id.toString()}`
    })
    return key
  }




  async profile(user: IUser) {
    user.phone = await decryption(user.phone as string)
    return { user }
  }



async updateProfile(
  data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
    DOB?: Date;
    gender?: GenderEnum;
    image?: string;
    coverImage?: string[];
  },
  user: IUser
) {

  if (data.phone) {
    data.phone = await encryption(data.phone);
  }

  const updatedUser = await this.userRepository.updateOne({
    filter: { _id: user._id },
    update: { $set: data }
  });

  return updatedUser;
}





  async rotateToken(payload: JwtPayloadType, user: HUser, issuer: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const accessExpiresIn = (payload.iat as number + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (5 * 6000)

    if (currentTime < accessExpiresIn) {
      throw new ConflictException("sorry we cannot create new login credintials while current access token still within valid time range")
    }

    const data = await this.tokenService.createLoginCredentials({ user, issuer })
    await this.tokenService.createRevokeToken({ payload })
    return data
  }


  async createRevokeToken({ payload }: { payload: jwt.JwtPayload }) {
    const consumedTime = (Math.ceil(Date.now() / 1000) - (payload.iat as number))
    const refreshExpiredIn = payload.iat as number + REFRESH_TOKEN_EXPIRES_IN
    const ttl = refreshExpiredIn - consumedTime
    await this.cacheService.set({ key: this.tokenService.userRevokeTokenKey({ userId: new mongoose.Types.ObjectId(payload.sub), jti: (payload.jti as string) }), value: payload.jti, ttl })
    return;
  }


  async logout(payload: JwtPayloadType, user: HUser, { action = LogoutEnum.DEVICE }) {

    switch (action) {
      case LogoutEnum.ALL:
        user.changeCredentialsTime 
        await user.save()
        await this.cacheService.del({ key: await this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: toObjectId(payload.sub) }) }) })
        break;

      default:
        await this.tokenService.createRevokeToken({
          payload: payload as jwt.JwtPayload & { sub: string; aud: number[]; jti: string; iat: number }
        })
        break;
    }
    return
  }



  async followUser({ userId }: { userId: string }, user: HydratedDocument<IUser>): Promise<IFollow> {

    const targetUser = await this.userRepository.findById({
      id: new mongoose.Types.ObjectId(userId)
    });

    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    if (user._id.toString() === userId) {
      throw new BadRequestException("You cannot follow yourself");
    }

    const existFollow = await this.followRepository.findOne({
      filter: {
        follower: user._id,
        following: targetUser._id
      }
    });

    if (existFollow) {
      throw new ConflictException("You are already following this user");
    }

    const follow = await this.followRepository.create({
      data: {
        follower: user._id,
        following: targetUser._id
      }
    });

    return follow;
  }



  async UnFollowUser({ userId }: { userId: string }, user: HydratedDocument<IUser>): Promise<void> {

    const targetUser = await this.userRepository.findById({
      id: new mongoose.Types.ObjectId(userId)
    });

    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    if (user._id.toString() === userId) {
      throw new BadRequestException("You cannot Unfollow yourself");
    }

    const existFollow = await this.followRepository.findOne({
      filter: {
        follower: user._id,
        following: targetUser._id
      }
    });

    if (!existFollow) {
      throw new NotFoundException("Follow not found");
    }

    await this.followRepository.deleteOne({
      filter: {
        follower: user._id,
        following: targetUser._id
      }
    });

  }

  async searchUsers({ keyword }: { keyword: string }, user: IUser):Promise<IUser[]> {

    if (!keyword?.trim()) {
        throw new BadRequestException("Search keyword is required");
    }

    const users = await this.userRepository.find({
        filter: {
            _id: { $ne: user._id },
            $or: [
                { firstName: { $regex: keyword.trim(), $options: "i" } },
                { lastName: { $regex: keyword.trim(), $options: "i" } },
                { username: { $regex: keyword.trim(), $options: "i" } }
            ]
        }
    });

    return users;
}




async getUserSuggestions(user: IUser) {

    const followingUsers = await this.followRepository.find({
        filter: {
            follower: user._id
        }
    });

    const followingIds = followingUsers.map(
        follow => follow.following
    );

    if (!followingIds.length) {
    return [];
}

   
    const suggestions = await this.followRepository.find({
        filter: {
            follower: { $in: followingIds },
            following: {
                $nin: [user._id, ...followingIds]
            }
        }
    });

    const users = await this.userRepository.find({
        filter: {
            _id: {
                $in: suggestions.map(follow => follow.following)
            }
        }
    });

    return users;
}




async updatePrivacySettings(
  { isPrivate }: { isPrivate: boolean },
  user: IUser
) {
  await this.userRepository.updateOne({
    filter: { _id: user._id },
    update: {
      $set: { isPrivate }
    }
  });

  return { message: "Privacy settings updated successfully" };
}









async deleteAccount(user: IUser) {

  await this.followRepository.deleteMany({
    filter: {
      $or: [
        { follower: user._id },
        { following: user._id }
      ]
    }
  });

  await this.userRepository.deleteOne({
    filter: { _id: user._id }
  });

  return { message: "Account deleted successfully" };
}



}

export default new UserService()