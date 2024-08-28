const errors = {
    ALREADY_EXIST: 'Une devise du même nom existe déjà.',
    NOT_EXIST: 'Cette devise n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette devise car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    LABEL_REQUIRED: "Le libellé est obligatoire.",
    LABEL_MUST_BE_STRING: "Le libellé doit être en texte.",
    SYMBOL_REQUIRED: "Le symbole est obligatoire.",
    SYMBOL_MUST_BE_STRING: "Le symbole doit être en texte.",
    DEVISE_ALREADY_EXIST: "Vous ne pouvez pas avoir deux devises dans l'application!"
}
const infos = {

}

export {
    errors,
    infos
}