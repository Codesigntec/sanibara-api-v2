import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodPipe } from 'src/validation/zod.pipe';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    Workspace,
    WorkspaceResponse,
    Credential,
    AuthResponse,
    ForgetPassword,
    ForgetPasswordResponse,
    ResetPassword,

    workspaceSchema,
    credentialSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    AuthRequest,
} from './auth.types';
import { WorkspaceGuard } from './workspace.guard';

// TODO:: DANS UN FUTUR PROCHE, IMPLEMENTER LA GESTION DES ACCES (permissions et roles) AU NIVEAU API

@Controller('auth')
@ApiTags('auth')
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(credentialSchema))
    @UseGuards(WorkspaceGuard)
    @ApiOkResponse({type: AuthResponse})
    async signin(@Body() credential: Credential, @Req() req: AuthRequest): Promise<AuthResponse> {
        const workspace = req.workspace
        console.log(workspace);
        
        return await this.auth.signin(credential, workspace)
    }

    @Post('/forget-password')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(forgetPasswordSchema))
    @UseGuards(WorkspaceGuard)
    @ApiOkResponse({type: ForgetPasswordResponse})
    async forgetPassword(@Body() fp: ForgetPassword): Promise<ForgetPasswordResponse> {
        return await this.auth.forgetPassword(fp)
    }

    @Post('/reset-password')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(resetPasswordSchema))
    @UseGuards(WorkspaceGuard)
    @ApiOkResponse({type: AuthResponse})
    async resetPassword(@Body() rp: ResetPassword, @Req() req: AuthRequest): Promise<AuthResponse> {
        const workspace = req.workspace
        return await this.auth.resetPassword(rp, workspace)
    }

    @Post('/workspace')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(workspaceSchema))
    @ApiOkResponse({type: WorkspaceResponse})
    async workspace(@Body() workspace: Workspace): Promise<WorkspaceResponse> {
        return await this.auth.signinDatabase(workspace)
    }
}
