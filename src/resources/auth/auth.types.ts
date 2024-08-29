import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { errors } from './auth.constant';
import { Request } from 'express';

export class Workspace {
  @ApiProperty()
  name: string
  @ApiProperty()
  app: string
}
export class Credential {
  @ApiProperty()
  email: string

  @ApiProperty()
  password: string
}

export class ForgetPassword {
  @ApiProperty()
  email: string
}

export class ResetPassword {
  @ApiProperty()
  email: string

  @ApiProperty()
  confirmationCode: number

  @ApiProperty()
  password: string
}

export interface UserAccessToken {
  email: string
  id: string
  nom: string
}
export interface AccessTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthRequest extends Request {
  workspace: string
}

export interface AuthAccessPayload {
  id?: string,
  nom?: string
  email?: string,
  key?: string,
}



// =============================================
export class WorkspaceResponse {
  @ApiProperty()
  token: string

  @ApiProperty()
  workspace: string
}

export class MagasinUtilisateurProduitFini{
  @ApiProperty()
  magasinId: string
}

export class MagasinUtilisateurMatierePremiere{
  @ApiProperty()
  magasinId: string
}

export class AuthResponse {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  refreshToken: string

  @ApiProperty()
  expireIn: number

  @ApiProperty()
  id: string

  @ApiProperty()
  nom: string

  @ApiProperty()
  email: string

  accesses: Permission[]

  magasinsProduitFinis: MagasinUtilisateurProduitFini[]

  accesMagasinsMatierePremieres: MagasinUtilisateurMatierePremiere[]

}

export class Permission {
  module: string
  read: boolean
  write: boolean
  remove: boolean
  archive: boolean
}

export class ForgetPasswordResponse {
  @ApiProperty()
  email: string
  
  @ApiProperty()
  confirmationCode: string
}

export const workspaceSchema = z
  .object({
    name: z.string({
      required_error: errors.WORKSPACE_REQUIRED,
      invalid_type_error: errors.WORKSPACE_MUST_BE_STRING,
    }),
    app: z.string(),
  })
  .required();


export const credentialSchema = z
  .object({
    email: z.string({
      required_error: errors.EMAIL_REQUIRED,
      invalid_type_error: errors.EMAIL_MUST_BE_STRING,
    }).email(errors.INVALID_EMAIL),
    password: z.string({
      required_error: errors.PASSWORD_REQUIRED
    }),
  })
  .required();
  
export const forgetPasswordSchema = z
  .object({
    email: z.string({
      required_error: errors.EMAIL_REQUIRED,
      invalid_type_error: errors.EMAIL_MUST_BE_STRING,
    }).email(errors.INVALID_EMAIL),
  })
  .required();

export const resetPasswordSchema = z
  .object({
    email: z.string({
      required_error: errors.EMAIL_REQUIRED,
      invalid_type_error: errors.EMAIL_MUST_BE_STRING,
    }).email(errors.INVALID_EMAIL),
    password: z.string({
      required_error: errors.PASSWORD_REQUIRED
    }),
    confirmationCode: z.string({
      required_error: errors.CONFIRMATION_CODE_REQUIRED,
      invalid_type_error: errors.CONFIRMATION_CODE_MUST_BE_NUMBER,
    }),
  })
  .required();
  export type WorkspacelSchema = z.infer<typeof workspaceSchema>;
  export type CredentialSchema = z.infer<typeof credentialSchema>;
  export type ForgetPasswordSchema = z.infer<typeof forgetPasswordSchema>;
  export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;