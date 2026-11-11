"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRepository = exports.CommentRepository = void 0;
const base_repository_1 = require("./base.repository");
const model_1 = require("../../DB/model");
class CommentRepository extends base_repository_1.DatabaseRepository {
    constructor() {
        super(model_1.CommentModel);
    }
}
exports.CommentRepository = CommentRepository;
exports.commentRepository = new CommentRepository();
