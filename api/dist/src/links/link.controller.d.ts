import { LinkService } from './link.service';
import type { RequestUser } from '../common/types/request-user';
import { CreateLinkDto, UpdateLinkDto } from './dto';
import { ListLinksQueryDto } from './dto/list-links.query.dto';
export declare class LinkController {
    private readonly linkService;
    constructor(linkService: LinkService);
    create(user: RequestUser, body: CreateLinkDto): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }>;
    listMine(user: RequestUser, query: ListLinksQueryDto): Promise<{
        total: number;
        items: ({
            user: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            slug: string;
            targetUrl: string;
            expiresAt: Date | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
        })[];
        page: number;
        pageSize: number;
    }>;
    listAll(query: ListLinksQueryDto): Promise<{
        total: number;
        items: ({
            user: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            slug: string;
            targetUrl: string;
            expiresAt: Date | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
        })[];
        page: number;
        pageSize: number;
    }>;
    getStats(): Promise<{
        totalLinks: number;
        activeLinks: number;
        totalEvents: number;
    }>;
    details(slug: string, user: RequestUser): Promise<{
        link: {
            id: string;
            slug: string;
            targetUrl: string;
            expiresAt: Date | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
        };
        counts: {
            last24h: number;
            last7d: number;
            allTime: number;
        };
        recentEvents: {
            timestamp: Date;
            userAgent: string | null;
            referrer: string | null;
        }[];
    }>;
    update(id: string, user: RequestUser, body: UpdateLinkDto): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }>;
    remove(id: string, user: RequestUser): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }>;
}
