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
exports.ProjectResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
const isAuth_1 = require("../middleware/isAuth");
let ProjectInput = class ProjectInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ProjectInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ProjectInput.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ProjectInput.prototype, "featuredImage", void 0);
ProjectInput = __decorate([
    type_graphql_1.InputType()
], ProjectInput);
let PaginatedProjects = class PaginatedProjects {
};
__decorate([
    type_graphql_1.Field(() => [entities_1.Projects]),
    __metadata("design:type", Array)
], PaginatedProjects.prototype, "projects", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedProjects.prototype, "hasMore", void 0);
PaginatedProjects = __decorate([
    type_graphql_1.ObjectType()
], PaginatedProjects);
let ProjectResolver = class ProjectResolver {
    textSnippet(project) {
        return project.description.slice(0, 50);
    }
    creator(project, { userLoader }) {
        return userLoader.load(project.creatorId);
    }
    voteStatus(project, { updootLoader, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId)
                return null;
            const updoot = yield updootLoader.load({
                projectId: project.id,
                userId: req.session.userId,
            });
            return updoot ? updoot.value : null;
        });
    }
    vote(projectId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUpdoot = value !== -1;
            const realValue = isUpdoot ? 1 : -1;
            const { userId } = req.session;
            const updoot = yield entities_1.Updoot.findOne({ where: { projectId, userId } });
            if (updoot && updoot.value !== realValue) {
                yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`  update updoot 
          set value = $1
        where "projectId" = $2 and "userId" = $3`, [realValue, projectId, userId]);
                    yield tm.query(`   update projects 
      set points = points + $1
      where id = $2
  `, [2 * realValue, projectId]);
                }));
            }
            else if (!updoot) {
                yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`  insert into updoot ("userId", "projectId", value)
       values ($1, $2, $3);`, [userId, projectId, realValue]);
                    yield tm.query(`   update projects 
      set points = points + $1
      where id = $2
  `, [realValue, projectId]);
                }));
            }
            return true;
        });
    }
    addCategory(projectId, title, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasCategory = title !== '';
            const realValue = hasCategory ? title : '';
            const { userId } = req.session;
            const category = yield entities_1.Categories.findOne({ where: { projectId, userId } });
            if (category && category.title !== realValue) {
                yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`  update categories 
          set value = $1
        where "projectId" = $2`, [realValue, projectId]);
                    yield tm.query(`   update projects 
      set categories = categories + $1
      where id = $2
  `, [realValue, projectId]);
                }));
            }
            else if (!category) {
                yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`  insert into categories ("projectId", title)
       values ($1, $2);`, [projectId, realValue]);
                    yield tm.query(`   update projects 
      set categories = categories + $1
      where id = $2
  `, [realValue, projectId]);
                }));
            }
            return true;
        });
    }
    projects(limit, cursor, {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const projects = yield typeorm_1.getConnection().query(`
      select p.*
      from projects p    
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
    `, replacements);
            return {
                projects: projects.slice(0, realLimit),
                hasMore: projects.length === realLimitPlusOne,
            };
        });
    }
    project(id) {
        return entities_1.Projects.findOne(id);
    }
    createProject(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return entities_1.Projects.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
        });
    }
    updateProject(id, title, description, featuredImage, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(entities_1.Projects)
                .set({ title, description, featuredImage })
                .where('id = :id  and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    deleteProject(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield entities_1.Projects.delete({ id, creatorId: req.session.userId });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Projects]),
    __metadata("design:returntype", void 0)
], ProjectResolver.prototype, "textSnippet", null);
__decorate([
    type_graphql_1.FieldResolver(() => entities_1.Users),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Projects, Object]),
    __metadata("design:returntype", void 0)
], ProjectResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Projects, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "voteStatus", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('projectId', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('value', () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "vote", null);
__decorate([
    type_graphql_1.Mutation(() => String),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('projectId', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('title', () => String)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "addCategory", null);
__decorate([
    type_graphql_1.Query(() => PaginatedProjects),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "projects", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Projects, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "project", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Projects),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProjectInput, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "createProject", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Projects, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('title')),
    __param(2, type_graphql_1.Arg('description')),
    __param(3, type_graphql_1.Arg('featuredImage')),
    __param(4, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "updateProject", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "deleteProject", null);
ProjectResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Projects)
], ProjectResolver);
exports.ProjectResolver = ProjectResolver;
//# sourceMappingURL=project.js.map