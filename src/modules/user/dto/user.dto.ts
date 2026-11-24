import {z} from "zod";
import { acceptFriendRequest, blockFriend, sendFriendRequest, unFriend } from "../user.validation";

export type SendFriendRequestDto = z.infer<ReturnType<typeof sendFriendRequest>>['body']
export type AcceptFriendRequestDto = z.infer<ReturnType<typeof acceptFriendRequest>>['params']
export type UnFriendRequestDto = z.infer<ReturnType<typeof unFriend>>['params']
export type BlockFriendRequestDto = z.infer<ReturnType<typeof blockFriend>>['params']