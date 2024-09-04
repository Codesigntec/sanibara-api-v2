const errors = {
    ALREADY_EXIST: 'Un magasin du même nom existe déjà.',
    NOT_EXIST: 'Cet magasin n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette magasin car elle peut-être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    NAME_REQUIRED: "Le nom est obligatoire.",
    NAME_MUST_BE_STRING: "Le nom doit être en texte.",
    ADDRESS_REQUIRED: "L'adresse est obligatoire.",
    ADDRESS_MUST_BE_STRING: "L'adresse doit être en texte.",
    USER_NOT_EXIST: "Cet utilisateur n'existe pas ou son ID n'est pas valide.",
}
const infos = {

}

export {
    errors,
    infos
}