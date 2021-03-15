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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projects = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const _1 = require(".");
const Updoot_1 = require("./Updoot");
let Projects = class Projects extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Projects.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Projects.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Projects.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Projects.prototype, "featuredImage", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Projects.prototype, "points", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], Projects.prototype, "voteStatus", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Projects.prototype, "creatorId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => _1.Users, (user) => user.projects),
    __metadata("design:type", _1.Users)
], Projects.prototype, "creator", void 0);
__decorate([
    typeorm_1.ManyToOne(() => _1.Categories, (categories) => categories.projects),
    __metadata("design:type", _1.Categories)
], Projects.prototype, "categories", void 0);
__decorate([
    typeorm_1.OneToMany(() => Updoot_1.Updoot, (updoot) => updoot.project),
    __metadata("design:type", Array)
], Projects.prototype, "updoots", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Projects.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Projects.prototype, "updatedAt", void 0);
Projects = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Projects);
exports.Projects = Projects;
//# sourceMappingURL=Projects.js.map