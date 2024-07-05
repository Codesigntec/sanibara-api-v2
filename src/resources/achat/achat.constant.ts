const errors = {
    ALREADY_EXIST: 'Un magasin du même nom existe déjà.',
    NOT_EXIST: 'Cet magasin n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette magasin car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    LABEL_REQUIRED: "Le libellé est obligatoire.",
    LABEL_MUST_BE_STRING: "Le libellé doit être en texte.",
    DATE_REQUIRED: "La date d'achat est obligatoire.",
    DATE_BE_STRING: "Le symbole doit être en texte.",

    TVA_REQUIRED: "La tva est obligatoire.",
    TVA_BE_NUMBER: "La tva doit être un entier.",
}


const infos = {

}

export {
    errors,
    infos
}