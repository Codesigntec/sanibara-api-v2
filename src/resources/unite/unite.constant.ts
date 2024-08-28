const errors = {
    ALREADY_EXIST: 'Une Unité du même nom existe déjà.',
    NOT_EXIST: 'Cette unité n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette unité car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    LABEL_REQUIRED: "Le libellé est obligatoire.",
    LABEL_MUST_BE_STRING: "Le libellé doit être en texte.",

    SYMBOLE_REQUIRED: "Le symbole est obligatoire.",
    SYMBOLE_MUST_BE_STRING: "Le symbole doit être en texte.",
}
const infos = {

}

export {
    errors,
    infos
}