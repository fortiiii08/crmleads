import { PrismaService } from '../../common/prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
}
