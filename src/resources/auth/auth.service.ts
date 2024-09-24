import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { errors } from './auth.constant';
import { App } from '@okucraft/code_central';
import * as bcrypt from 'bcryptjs'
import { generateConfirmationCode } from 'src/tools/functions';
import { sendConfirmationCodeByEmail } from 'src/tools/messenger';
import {
    Workspace,
    WorkspaceResponse,
    Credential,
    AuthResponse,
    ForgetPassword,
    ForgetPasswordResponse,
    ResetPassword,
    UserAccessToken,
    AccessTokens
} from './auth.types';

@Injectable()
export class AuthService {

    constructor(
        private jwt: JwtService,
        private db: PrismaClient,
        private prisma: PrismaService
    ) { }

    signinDatabase = async (workspace: Workspace): Promise<WorkspaceResponse> => {
        try {
            const space = await this.prisma.store.findUnique({
                where: {
                    app_db: {
                        app: workspace.app as App,
                        db: workspace.name
                    }
                },
                select: {
                    key: true,
                    name: true,
                    subscriptions: {
                        select: {
                            end: true
                        }
                    }
                }
            })
            if (space === null) throw new HttpException(errors.INVALID_WORKSPACE, HttpStatus.FORBIDDEN);

            let end: Date | null = null
            space.subscriptions.forEach(subscription => {
                if (subscription.end >= new Date()) {
                    end = subscription.end
                }
            });
            if (end === null) throw new HttpException(errors.SUBSCRIPTION_EXPIRED, HttpStatus.FORBIDDEN);

            const accessToken = this.jwt.sign({
                key: space.key,
                workspace: space.name,
                end: end
            })

            return {
                token: accessToken,
                workspace: space.name
            }
        } catch (error) {
            console.log("error: ", error.message)
            console.log("error: ", error.status)
            if (error.status) throw new HttpException(error.message, error.status);
            else throw new HttpException(errors.UNEXPECTED_ERROR, HttpStatus.BAD_REQUEST);
        }
    }

    signin = async (crd: Credential, workspace: string): Promise<AuthResponse> => {
        const user = await this.db.utilisateur.findUnique({
            where: { email: crd.email },
            include: {
                role: {
                    select: {
                        libelle: true,
                        accesses: {
                            select: {
                                module: true,
                                read: true,
                                write: true,
                                remove: true,
                                archive: true,
                            }
                        }
                    }
                },
                accesMagasinsProduitsFinis: true,
                accesMagasinsMatierePremieres: true
            }
        })
        if (!user) throw new HttpException(errors.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);

        const passwordIsValid = bcrypt.compareSync(crd.password, user.password)

        if (!passwordIsValid) throw new HttpException(errors.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST)
        if (!user.status && (user.removed || user.archive)) throw new HttpException(errors.ACCOUNT_DISABLED, HttpStatus.BAD_REQUEST);

        const tokens = this.generateJsonWebTokenAccess({ id: user.id, nom: user.nom, email: user.email }, workspace)
        const auth: AuthResponse = {
            id: user.id,
            email: user.email,
            nom: user.nom,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expireIn: 3600 * 1000 * 3,
            accesses: user.role.accesses,
            magasinsProduitFinis: user.accesMagasinsProduitsFinis,
            accesMagasinsMatierePremieres: user.accesMagasinsMatierePremieres
        }

        return auth
    }

    forgetPassword = async (fp: ForgetPassword): Promise<ForgetPasswordResponse> => {
        const user = await this.db.utilisateur.findUnique({ where: { email: fp.email } })
        if (!user) throw new HttpException(errors.INVALID_EMAIL, HttpStatus.BAD_REQUEST);

        let confirmationCode = 0
        if (user.confirmationCode !== null && user.confirmationCode !== 0) {
            confirmationCode = user.confirmationCode
        } else {
            confirmationCode = generateConfirmationCode()
            await this.db.utilisateur.update({
                data: {
                    confirmationCode,
                },
                where: { id: user.id }
            })
        }
        console.log("confirmationCode", confirmationCode)
        const cryptedConfirmationCode = bcrypt.hashSync(`${confirmationCode}`, 10)

        // const isSent = await sendConfirmationCodeByEmail(user.email, confirmationCode)
        const isSent = true
        if (isSent) return { email: user.email, confirmationCode: cryptedConfirmationCode }
        else throw new HttpException(errors.ERROR_ON_SMS_SEND, HttpStatus.BAD_REQUEST)
    }

    resetPassword = async (sign: ResetPassword, workspace: string): Promise<AuthResponse> => {
        const check = await this.db.utilisateur.findUnique({
            where: { email: sign.email },
            include: {
                role: {
                    select: {
                        libelle: true,
                        accesses: {
                            select: {
                                module: true,
                                read: true,
                                write: true,
                                remove: true,
                                archive: true,
                            }
                        }
                    }
                },
                accesMagasinsProduitsFinis: true,
                accesMagasinsMatierePremieres: true
            }
        })
        if (!check) throw new HttpException(errors.INVALID_EMAIL, HttpStatus.BAD_REQUEST)

        // if (!check.status) throw new HttpException(httpStatus.BAD_REQUEST, errors.ACCOUNT_SUSPENDED)

        const cryptedPassword = bcrypt.hashSync(sign.password, 10)

        if (check.confirmationCode == sign.confirmationCode) {
            const user = await this.db.utilisateur.update({
                data: {
                    password: cryptedPassword,
                    confirmationCode: 0,
                },
                where: { email: sign.email }
            })
            if (user.id) {
                const tokens = this.generateJsonWebTokenAccess({ id: user.id, nom: user.nom, email: user.email }, workspace)
                const auth: AuthResponse = {
                    id: check.id,
                    email: check.email,
                    nom: check.nom,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expireIn: 3600 * 1000 * 3,
                    accesses: check.role.accesses,
                    magasinsProduitFinis: check.accesMagasinsProduitsFinis,
                    accesMagasinsMatierePremieres: check.accesMagasinsMatierePremieres
                }

                return auth
            } else {
                throw new HttpException(errors.ERROR_ON_RESET_PASSWORD, HttpStatus.BAD_REQUEST)
            }
        } else {
            throw new HttpException(errors.INVALID_CONFIRMATION_CODE, HttpStatus.BAD_REQUEST)
        }
    }

    private generateJsonWebTokenAccess = (uat: UserAccessToken, workspace: string): AccessTokens => {
        const accessToken = this.jwt.sign({
            id: uat.id,
            nom: uat.nom,
            email: uat.email,
            key: workspace
        })

        const refreshToken = this.jwt.sign({
            id: uat.id,
            nom: uat.nom,
            email: uat.email,
            key: workspace
        },
            {
                expiresIn: 3600 * 1000 * 24 * 7 // 7 jours
            })

        return { accessToken, refreshToken }

    }

}
