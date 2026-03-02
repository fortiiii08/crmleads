import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string;
            tenant: {
                id: string;
                name: string;
                slug: string;
            };
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        name: string;
        tenant: {
            id: string;
            slug: string;
            name: string;
        };
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
