import type { Response } from 'express';
import type { Request } from 'express';
import { LinkService } from './link.service';
export declare class RedirectController {
    private readonly linkService;
    private readonly logger;
    constructor(linkService: LinkService);
    redirect(slug: string, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
