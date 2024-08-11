const errors = {
    ALREADY_EXIST: 'Une Unité du même nom existe déjà.',
    NOT_EXIST: 'Cette unité n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette unité car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    NOM_REQUIRED: "Le nom est obligatoire.",
    NOM_MUST_BE_STRING: "Le nom doit être en texte.",

    EMAIL_REQUIRED: "L'adresse e-mail est obligatoire.",
    EMAIL_MUST_BE_STRING: "L'adresse e-mail doit être en texte.",
    INVALID_EMAIL: "Cet adresse e-mail est incorrect.",

    TELEPHONE_REQUIRED: "Le numéro de telephone est obligatoire.",
    TELEPHONE_MUST_BE_STRING: "Le numéro de telephone doit être en texte.",

    ADRESSE_REQUIRED: "L'adresse est obligatoire.",
    ADRESSE_MUST_BE_STRING: "L'adresse doit être en texte.",

    LOGO_MUST_BE_STRING: "Le logo doit être en texte.",
  


}
const infos = {

}

export {
    errors,
    infos
}