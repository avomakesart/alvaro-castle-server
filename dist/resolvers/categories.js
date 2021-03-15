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
exports.CategoryResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
const isAuth_1 = require("../middleware/isAuth");
let CategoryInput = class CategoryInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CategoryInput.prototype, "title", void 0);
CategoryInput = __decorate([
    type_graphql_1.InputType()
], CategoryInput);
let PaginatedCategories = class PaginatedCategories {
};
__decorate([
    type_graphql_1.Field(() => [entities_1.Categories]),
    __metadata("design:type", Array)
], PaginatedCategories.prototype, "categories", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedCategories.prototype, "hasMore", void 0);
PaginatedCategories = __decorate([
    type_graphql_1.ObjectType()
], PaginatedCategories);
let CategoryResolver = class CategoryResolver {
    createCategory(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return entities_1.Categories.create(Object.assign({}, input)).save();
        });
    }
    updateCategory(id, title) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(entities_1.Categories)
                .set({ title })
                .where('id = :id', { id })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    categories(limit, cursor, {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const categories = yield typeorm_1.getConnection().query(`
      select c.*
      from categories c   
      ${cursor ? `where c."createdAt" < $2` : ''}
      order by c."createdAt" DESC
      limit $1
    `, replacements);
            return {
                categories: categories.slice(0, realLimit),
                hasMore: categories.length === realLimitPlusOne,
            };
        });
    }
    category(id) {
        return entities_1.Categories.findOne(id);
    }
};
__decorate([
    type_graphql_1.Mutation(() => entities_1.Categories),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CategoryInput]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "createCategory", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Categories, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('title')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "updateCategory", null);
__decorate([
    type_graphql_1.Query(() => PaginatedCategories),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "categories", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Categories, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "category", null);
CategoryResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Categories)
], CategoryResolver);
exports.CategoryResolver = CategoryResolver;
//# sourceMappingURL=categories.js.map