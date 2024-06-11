const errors = {
    UNEXPECTED_ERROR: "Une erreur inattendue s'est produite.",

    UNAUTHORIZED_OR_EXPIRED_WORKSPACE: "Le nom de l'espace de travail n'existe pas et/ou l'abonnement a expiré.",
    INVALID_WORKSPACE: "Ce nom d'espace de travail n'existe pas et/ou abonnement a expiré.",
    INVALID_CREDENTIALS: "Adresse email et/ou mot de passe incorrect.",
    ACCOUNT_DISABLED: "Votre compte a désactivé et/ou supprimé, veuillez contacter votre administrateur.",
    INVALID_EMAIL: "Cet adresse e-mail est incorrect.",
    SUBSCRIPTION_EXPIRED: "Ce nom d'espace de travail n'existe pas et/ou abonnement a expiré.",
    ERROR_ON_SMS_SEND: "Une erreur s'est produite lors de l'envoie message.",
    ERROR_ON_RESET_PASSWORD: "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
    INVALID_CONFIRMATION_CODE: "Ce code de confirmation n'est pas valide.",

    WORKSPACE_REQUIRED: "Le nom de l'espace de travail est obligatoire.",
    WORKSPACE_MUST_BE_STRING: "Le nom de l'espace de travail doit être en texte.",
    WORKSPACE_SUBSCRIPTION_EXPIRED: "Votre abonement actuel est expiré.\nVeuillez contacter Codesign pour plus information.",
    UNAUTHORIZED_TOKEN: "Vous n'êtes pas autorisé à effectué cette action.",
    EMAIL_REQUIRED: "L'adresse e-mail est obligatoire.",
    EMAIL_MUST_BE_STRING: "L'adresse e-mail doit être en texte.",
    
    PASSWORD_REQUIRED: "Le mot de passe est obligatoire.",

    CONFIRMATION_CODE_REQUIRED: "Le code de confirmation est obligatoire.",
    CONFIRMATION_CODE_MUST_BE_NUMBER: "Le code de confirmation doit être en chiffre.",


}
const infos = {

}

export {
    errors,
    infos
}