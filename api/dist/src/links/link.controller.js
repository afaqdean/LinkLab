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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkController = void 0;
const common_1 = require("@nestjs/common");
const link_service_1 = require("./link.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const dto_1 = require("./dto");
const list_links_query_dto_1 = require("./dto/list-links.query.dto");
const common_2 = require("@nestjs/common");
let LinkController = class LinkController {
    linkService;
    constructor(linkService) {
        this.linkService = linkService;
    }
    async create(user, body) {
        const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
        return this.linkService.createLink(user.id, {
            targetUrl: body.targetUrl,
            slug: body.slug,
            expiresAt,
            isActive: body.isActive,
        });
    }
    async listMine(user, query) {
        const { page = 1, pageSize = 10, q } = query;
        return this.linkService.listOwnLinksPaged(user.id, page, pageSize, q);
    }
    async listAll(query) {
        const { page = 1, pageSize = 10, q } = query;
        return this.linkService.listAllLinksPaged(page, pageSize, q);
    }
    async getStats() {
        return this.linkService.getSystemStats();
    }
    async details(slug, user) {
        return this.linkService.getLinkDetailsBySlugForUser(slug, user.id, user.role);
    }
    async update(id, user, body) {
        const expiresAt = body.expiresAt === undefined
            ? undefined
            : body.expiresAt
                ? new Date(body.expiresAt)
                : null;
        return this.linkService.updateLink(id, user.id, user.role, {
            targetUrl: body.targetUrl,
            slug: body.slug,
            expiresAt,
            isActive: body.isActive,
        });
    }
    async remove(id, user) {
        return this.linkService.softDeleteLink(id, user.id, user.role);
    }
};
exports.LinkController = LinkController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateLinkDto]),
    __metadata("design:returntype", Promise)
], LinkController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_2.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_links_query_dto_1.ListLinksQueryDto]),
    __metadata("design:returntype", Promise)
], LinkController.prototype, "listMine", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __param(0, (0, common_2.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_links_query_dto_1.ListLinksQueryDto]),
    __metadata("design:returntype", Promise)
], LinkController.prototype, "listAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LinkController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':slug/details'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LinkController.prototype, "details", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.UpdateLinkDto]),
    __metadata("design:returntype", Promise)
], LinkController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LinkController.prototype, "remove", null);
exports.LinkController = LinkController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('links'),
    __metadata("design:paramtypes", [link_service_1.LinkService])
], LinkController);
//# sourceMappingURL=link.controller.js.map