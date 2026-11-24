"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendRequestRepository = exports.FriendRequestRepository = void 0;
const base_repository_1 = require("./base.repository");
const model_1 = require("../../DB/model");
class FriendRequestRepository extends base_repository_1.DatabaseRepository {
    constructor() {
        super(model_1.FriendRequestModel);
    }
}
exports.FriendRequestRepository = FriendRequestRepository;
exports.friendRequestRepository = new FriendRequestRepository();
