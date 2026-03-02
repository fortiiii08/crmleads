import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    me(user: any): Promise<{
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
export {};
