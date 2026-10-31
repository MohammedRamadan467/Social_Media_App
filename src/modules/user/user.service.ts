import jwt from "jsonwebtoken";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exception";
import { FollowRepository, UserRepository } from "../../common/repository";
import { createLoginCredentials, createRevokeToken, decryption, encryption, userBaseRevokeTokenKey, userRevokeTokenKey } from "../../common/security";
import { cacheService, CacheService } from "../../common/service";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config";
import { IUser } from "../../common/interface";
import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, LogoutEnum, RoleEnum } from "../../common/enum";
import { IFollow } from "../../common/interface/follow.interface";


class UserService {
  private userRepository: UserRepository
  private cacheService: CacheService
  private followRepository: FollowRepository
  constructor() {
    this.cacheService = cacheService
    this.userRepository = new UserRepository()
    this.followRepository = new FollowRepository()
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





  async rotateToken(payload: jwt.JwtPayload, user: { _id: mongoose.Types.ObjectId, role: RoleEnum }, issuer: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const accessExpiresIn = (payload.iat as number + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (5 * 6000)

    if (currentTime < accessExpiresIn) {
      throw new ConflictException("sorry we cannot create new login credintials while current access token still within valid time range")
    }

    const data = await createLoginCredentials({ user, issuer })
    await createRevokeToken({ payload })
    return data
  }


  async createRevokeToken({ payload }: { payload: jwt.JwtPayload }) {
    const consumedTime = (Math.ceil(Date.now() / 1000) - (payload.iat as number))
    const refreshExpiredIn = payload.iat as number + REFRESH_TOKEN_EXPIRES_IN
    const ttl = refreshExpiredIn - consumedTime
    await cacheService.set({ key: userRevokeTokenKey({ userId: new mongoose.Types.ObjectId(payload.sub), jti: (payload.jti as string) }), value: payload.jti, ttl })
    return;
  }


  async logout(payload: jwt.JwtPayload, user: HydratedDocument<IUser>, { action = LogoutEnum.DEVICE }) {

    switch (action) {
      case LogoutEnum.ALL:
        user.changeCredentialsTime = new Date() as unknown as string
        await user.save()
        await cacheService.del({ key: await cacheService.keys({ prefix: userBaseRevokeTokenKey({ userId: new mongoose.Types.ObjectId(payload.sub) }) }) })
        break;

      default:
        await createRevokeToken({ payload })
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