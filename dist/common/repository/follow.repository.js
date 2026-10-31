"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followRepository = exports.FollowRepository = void 0;
const base_repository_1 = require("./base.repository");
const model_1 = require("../../DB/model");
class FollowRepository extends base_repository_1.DatabaseRepository {
    constructor() {
        super(model_1.FollowModel);
    }
}
exports.FollowRepository = FollowRepository;
exports.followRepository = new FollowRepository();
