import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(user: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
}
