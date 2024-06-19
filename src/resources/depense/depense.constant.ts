const errors = {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
    NAME_ALREADY_EXIST: 'Un article avec la même désigation e-mail existe déjà.',
    NOT_EXIST: 'Cette catégorie n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette catégorie car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    MOTIF_REQUIRED: "Le motif est obligatoire.",
    MOTIF_MUST_BE_STRING: "Le motif doit être en texte.",
    MOTIF_MUST_HAVE_3_DIGIT: "Le motif doit avoir au moins 3 caractères.",

    DATE_REQUIRED: "La date est obligatoire.",
    DATE_INVALID: "La date n'est pas valide.",

    AMOUNT_REQUIRED: "Le montant est obligatoire.",
    AMOUNT_INVALID: "Le montant n'est pas valide.",
    AMOUNT_INVALID2: "Le montant n'est pas peut être négatif.",
}
const infos = {

}

export {
    errors,
    infos
}