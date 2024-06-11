const errors = {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
    EMAIL_ALREADY_EXIST: 'Cet adresse e-mail existe déjà.',
    NOT_EXIST: 'Cette catégorie n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette catégorie car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    NAME_REQUIRED: "Le nom est obligatoire.",
    NAME_MUST_BE_STRING: "Le nom doit être en texte.",
    NAME_MUST_HAVE_2_DIGIT: "Le nom doit avoir au moins 2 caractères.",

    EMAIL_REQUIRED: "L'adresse e-mail est obligatoire.",
    EMAIL_MUST_BE_STRING: "L'adresse e-mail doit être en texte.",
    INVALID_EMAIL: "Cet adresse e-mail est incorrect.",
    
    PASSWORD_REQUIRED: "Le mot de passe est obligatoire.",
    PASSWORD_MUST_HAVE_6_DIGIT: "Le mot de passe doit avoir au moins 6 caractères.",
    
    ROLE_REQUIRED: "Le rôle est obligatoire.",
    INVALID_STORE: "Le magasin n'est pas valide.",
}
const infos = {

}

export {
    errors,
    infos
}