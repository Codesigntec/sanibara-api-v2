const errors = {
    EMAIL_ALREADY_EXIST: 'Cet adresse e-mail existe déjà.',
    NOT_EXIST: 'Cette catégorie n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette catégorie car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    NAME_REQUIRED: "Le nom est obligatoire.",
    NAME_MUST_BE_STRING: "Le nom doit être en texte.",
    NAME_MUST_HAVE_2_DIGIT: "Le nom doit avoir au moins 2 caractères.",

    PHONE_MUST_BE_STRING: "Le téléphone doit être en texte.",
    PHONE_MUST_HAVE_8_DIGIT: "Le téléphone doit avoir au moins 8 caractères.",

    EMAIL_MUST_BE_STRING: "L'adresse e-mail doit être en texte.",
    INVALID_EMAIL: "Cet adresse e-mail est incorrect.",
    
    ADDRESS_MUST_BE_STRING: "L'adresse doit être en texte.",
    ORG_MUST_BE_STRING: "Le nom de la societé doit être en texte.",
    
}

const infos = {

}

export {
    errors,
    infos
}