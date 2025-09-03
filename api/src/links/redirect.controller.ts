import { Controller, Get, Param, Res, Req, Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { Request } from 'express';
import { LinkService } from './link.service';

@Controller()
export class RedirectController {
  private readonly logger = new Logger(RedirectController.name);

  constructor(private readonly linkService: LinkService) {}

  @Get(':slug')
  async redirect(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.logger.log(`Redirect requested for slug=${slug}`);
    const link = await this.linkService.getActiveLinkBySlug(slug);

    if (!link) {
      this.logger.log(`Link not found for slug=${slug}, returning 404`);
      return res.status(404).send('Not found');
    }

    this.logger.log(`Link found for slug=${slug}, targetUrl=${link.targetUrl}`);

    const forwardedFor = req.get('x-forwarded-for');
    const ip =
      (forwardedFor ? forwardedFor.split(',')[0]?.trim() : undefined) ||
      req.socket?.remoteAddress ||
      req.ip;

    const userAgent = req.get('user-agent') ?? null;

    const referrer = req.get('referer') ?? req.get('referrer') ?? null;
    // do not block the redirect; log success/failure
    this.linkService
      .recordEvent({
        linkId: link.id,
        ipAddress: ip ?? null,
        userAgent: typeof userAgent === 'string' ? userAgent : null,
        referrer,
      })
      .then(() => this.logger.log(`Recorded redirect event for slug=${slug}`))
      .catch((e: unknown) =>
        this.logger.error(
          `Failed to record event for slug=${slug}`,
          e as Error,
        ),
      );
    this.logger.log(`Redirecting slug=${slug} -> ${link.targetUrl}`);
    return res.redirect(301, link.targetUrl);
  }
}
