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
exports.CertificateResolver = void 0;
const entities_1 = require("../entities");
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let CertificateInput = class CertificateInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CertificateInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CertificateInput.prototype, "issuer", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CertificateInput.prototype, "companyImg", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CertificateInput.prototype, "date", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CertificateInput.prototype, "certId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CertificateInput.prototype, "certUrl", void 0);
CertificateInput = __decorate([
    type_graphql_1.InputType()
], CertificateInput);
let PaginatedCertificates = class PaginatedCertificates {
};
__decorate([
    type_graphql_1.Field(() => [entities_1.Certificates]),
    __metadata("design:type", Array)
], PaginatedCertificates.prototype, "certificates", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedCertificates.prototype, "hasMore", void 0);
PaginatedCertificates = __decorate([
    type_graphql_1.ObjectType()
], PaginatedCertificates);
let CertificateResolver = class CertificateResolver {
    createCertificate(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const newInput = new Array(Object.assign({}, input));
            const cool = newInput.map((data) => {
                data.issuer === 'Linkedin'
                    ? (data.companyImg = data.companyImg =
                        'https://res.cloudinary.com/bluecatencode/image/upload/v1613840696/linkedin-logo_yorqtv.png')
                    : data.issuer === 'Udemy'
                        ? (data.companyImg = data.companyImg =
                            'https://res.cloudinary.com/bluecatencode/image/upload/v1613840356/udemy-logo.jpg')
                        : '';
                return data;
            });
            return entities_1.Certificates.create(cool[0]).save();
        });
    }
    updateCertificate(id, title, issuer, companyImg, date, certId, certUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(entities_1.Certificates)
                .set({ title, issuer, companyImg, date, certId, certUrl })
                .where('id = :id', { id })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    certificates(limit, cursor, {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const certificates = yield typeorm_1.getConnection().query(`
      select c.*
      from certificates c   
      ${cursor ? `where c."createdAt" < $2` : ''}
      order by c."createdAt" DESC
      limit $1
    `, replacements);
            return {
                certificates: certificates.slice(0, realLimit),
                hasMore: certificates.length === realLimitPlusOne,
            };
        });
    }
    certificate(id) {
        return entities_1.Certificates.findOne(id);
    }
    deleteCertificate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield entities_1.Certificates.delete({ id });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => entities_1.Certificates),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CertificateInput]),
    __metadata("design:returntype", Promise)
], CertificateResolver.prototype, "createCertificate", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Certificates, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('title')),
    __param(2, type_graphql_1.Arg('issuer')),
    __param(3, type_graphql_1.Arg('companyImg')),
    __param(4, type_graphql_1.Arg('date')),
    __param(5, type_graphql_1.Arg('certId')),
    __param(6, type_graphql_1.Arg('certUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CertificateResolver.prototype, "updateCertificate", null);
__decorate([
    type_graphql_1.Query(() => PaginatedCertificates),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], CertificateResolver.prototype, "certificates", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Certificates, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CertificateResolver.prototype, "certificate", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CertificateResolver.prototype, "deleteCertificate", null);
CertificateResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Certificates)
], CertificateResolver);
exports.CertificateResolver = CertificateResolver;
//# sourceMappingURL=certificates.js.map