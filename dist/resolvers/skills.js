"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillResolver = void 0;
const entities_1 = require("../entities");
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let SkillInput = class SkillInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], SkillInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], SkillInput.prototype, "image", void 0);
SkillInput = __decorate([
    type_graphql_1.InputType()
], SkillInput);
let PaginatedSkills = class PaginatedSkills {
};
__decorate([
    type_graphql_1.Field(() => [entities_1.Skills]),
    __metadata("design:type", Array)
], PaginatedSkills.prototype, "skills", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedSkills.prototype, "hasMore", void 0);
PaginatedSkills = __decorate([
    type_graphql_1.ObjectType()
], PaginatedSkills);
let SkillResolver = class SkillResolver {
    createSkill(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillFind = entities_1.Skills.findOne(input.title);
            if (skillFind) {
                throw new Error('Ups! skill already created');
            }
            return entities_1.Skills.create(Object.assign({}, input)).save();
        });
    }
    updateSkill(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(entities_1.Skills)
                .set(Object.assign({}, input))
                .where('id = :id', { id })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    skills(limit, cursor, {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const skills = yield typeorm_1.getConnection().query(`
      select s.*
      from skills s   
      ${cursor ? `where s."createdAt" < $2` : ''}
      order by s."createdAt" DESC
      limit $1
    `, replacements);
            return {
                skills: skills.slice(0, realLimit),
                hasMore: skills.length === realLimitPlusOne,
            };
        });
    }
    skill(id) {
        return entities_1.Skills.findOne(id);
    }
    deleteSkill(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield entities_1.Skills.delete({ id });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => entities_1.Skills),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SkillInput]),
    __metadata("design:returntype", Promise)
], SkillResolver.prototype, "createSkill", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Skills, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, SkillInput]),
    __metadata("design:returntype", Promise)
], SkillResolver.prototype, "updateSkill", null);
__decorate([
    type_graphql_1.Query(() => PaginatedSkills),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], SkillResolver.prototype, "skills", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Skills, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SkillResolver.prototype, "skill", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SkillResolver.prototype, "deleteSkill", null);
SkillResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Skills)
], SkillResolver);
exports.SkillResolver = SkillResolver;
//# sourceMappingURL=skills.js.map