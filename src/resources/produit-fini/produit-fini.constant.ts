const errors = {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
    NAME_ALREADY_EXIST: 'Une matière prémière avec la même désigation existe déjà.',
    NOT_EXIST: 'Cette catégorie n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette catégorie car elle peut-être liée à une matière prémière\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    NAME_REQUIRED: "La designation est obligatoire.",
    NAME_MUST_BE_STRING: "La designation doit être en texte.",
    NAME_MUST_HAVE_2_DIGIT: "La designation doit avoir au moins 2 caractères.",


    CATEGORY_REQUIRED: "La catégorie de la matière prémière est obligatoire.",
    CATEGORY_MUST_BE_STRING: "La catégorie n'est pas valide.",
    UNITY_REQUIRED: "L'unité de la matière prémière est obligatoire.",
    UNITY_MUST_BE_STRING: "L'unité n'est pas valide.",
    DESC_MUST_BE_STRING: "La description n'est pas valide.",
}
const infos = {

}

export {
    errors,
    infos
}