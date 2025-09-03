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
var RedirectController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectController = void 0;
const common_1 = require("@nestjs/common");
const link_service_1 = require("./link.service");
let RedirectController = RedirectController_1 = class RedirectController {
    linkService;
    logger = new common_1.Logger(RedirectController_1.name);
    constructor(linkService) {
        this.linkService = linkService;
    }
    async redirect(slug, req, res) {
        this.logger.log(`Redirect requested for slug=${slug}`);
        const link = await this.linkService.getActiveLinkBySlug(slug);
        if (!link) {
            this.logger.log(`Link not found for slug=${slug}, returning 404`);
            return res.status(404).send('Not found');
        }
        this.logger.log(`Link found for slug=${slug}, targetUrl=${link.targetUrl}`);
        const forwardedFor = req.get('x-forwarded-for');
        const ip = (forwardedFor ? forwardedFor.split(',')[0]?.trim() : undefined) ||
            req.socket?.remoteAddress ||
            req.ip;
        const userAgent = req.get('user-agent') ?? null;
        const referrer = req.get('referer') ?? req.get('referrer') ?? null;
        this.linkService
            .recordEvent({
            linkId: link.id,
            ipAddress: ip ?? null,
            userAgent: typeof userAgent === 'string' ? userAgent : null,
            referrer,
        })
            .then(() => this.logger.log(`Recorded redirect event for slug=${slug}`))
            .catch((e) => this.logger.error(`Failed to record event for slug=${slug}`, e));
        this.logger.log(`Redirecting slug=${slug} -> ${link.targetUrl}`);
        return res.redirect(301, link.targetUrl);
    }
};
exports.RedirectController = RedirectController;
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RedirectController.prototype, "redirect", null);
exports.RedirectController = RedirectController = RedirectController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [link_service_1.LinkService])
], RedirectController);
//# sourceMappingURL=redirect.controller.js.map