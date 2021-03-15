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
exports.ContactResolver = void 0;
const entities_1 = require("../entities");
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let ContactInput = class ContactInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ContactInput.prototype, "fullname", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ContactInput.prototype, "subject", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ContactInput.prototype, "phone", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ContactInput.prototype, "message", void 0);
ContactInput = __decorate([
    type_graphql_1.InputType()
], ContactInput);
let PaginatedContact = class PaginatedContact {
};
__decorate([
    type_graphql_1.Field(() => [entities_1.Contact]),
    __metadata("design:type", Array)
], PaginatedContact.prototype, "contact", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedContact.prototype, "hasMore", void 0);
PaginatedContact = __decorate([
    type_graphql_1.ObjectType()
], PaginatedContact);
let ContactResolver = class ContactResolver {
    createContact(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillFind = entities_1.Contact.findOne(input.subject);
            if (skillFind) {
                throw new Error('Ups! experience already created');
            }
            return entities_1.Contact.create(Object.assign({}, input)).save();
        });
    }
    updateContact(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(entities_1.Contact)
                .set(Object.assign({}, input))
                .where('id = :id', { id })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    contacts(limit, cursor, {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const contact = yield typeorm_1.getConnection().query(`
      select c.*
      from contact c   
      ${cursor ? `where c."createdAt" < $2` : ''}
      order by c."createdAt" DESC
      limit $1
    `, replacements);
            return {
                contact: contact.slice(0, realLimit),
                hasMore: contact.length === realLimitPlusOne,
            };
        });
    }
    contact(id) {
        return entities_1.Contact.findOne(id);
    }
    deleteContact(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield entities_1.Contact.delete({ id });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => entities_1.Contact),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ContactInput]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "createContact", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Contact, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ContactInput]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "updateContact", null);
__decorate([
    type_graphql_1.Query(() => PaginatedContact),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "contacts", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Contact, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "contact", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "deleteContact", null);
ContactResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Contact)
], ContactResolver);
exports.ContactResolver = ContactResolver;
//# sourceMappingURL=contact.js.map