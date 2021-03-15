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
exports.ExperienceResolver = void 0;
const entities_1 = require("../entities");
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let ExperienceInput = class ExperienceInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ExperienceInput.prototype, "company", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ExperienceInput.prototype, "position", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ExperienceInput.prototype, "period", void 0);
ExperienceInput = __decorate([
    type_graphql_1.InputType()
], ExperienceInput);
let PaginatedExperience = class PaginatedExperience {
};
__decorate([
    type_graphql_1.Field(() => [entities_1.Experience]),
    __metadata("design:type", Array)
], PaginatedExperience.prototype, "experience", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedExperience.prototype, "hasMore", void 0);
PaginatedExperience = __decorate([
    type_graphql_1.ObjectType()
], PaginatedExperience);
let ExperienceResolver = class ExperienceResolver {
    createExperience(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillFind = entities_1.Experience.findOne(input.company);
            if (skillFind) {
                throw new Error('Ups! experience already created');
            }
            return entities_1.Experience.create(Object.assign({}, input)).save();
        });
    }
    updateExperience(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(entities_1.Experience)
                .set(Object.assign({}, input))
                .where('id = :id', { id })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    experiences(limit, cursor, {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const experience = yield typeorm_1.getConnection().query(`
      select e.*
      from experience e   
      ${cursor ? `where e."createdAt" < $2` : ''}
      order by e."createdAt" DESC
      limit $1
    `, replacements);
            return {
                experience: experience.slice(0, realLimit),
                hasMore: experience.length === realLimitPlusOne,
            };
        });
    }
    experience(id) {
        return entities_1.Experience.findOne(id);
    }
    deleteExperience(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield entities_1.Experience.delete({ id });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => entities_1.Experience),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExperienceInput]),
    __metadata("design:returntype", Promise)
], ExperienceResolver.prototype, "createExperience", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Experience, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ExperienceInput]),
    __metadata("design:returntype", Promise)
], ExperienceResolver.prototype, "updateExperience", null);
__decorate([
    type_graphql_1.Query(() => PaginatedExperience),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ExperienceResolver.prototype, "experiences", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Experience, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ExperienceResolver.prototype, "experience", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ExperienceResolver.prototype, "deleteExperience", null);
ExperienceResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Experience)
], ExperienceResolver);
exports.ExperienceResolver = ExperienceResolver;
//# sourceMappingURL=experience.js.map