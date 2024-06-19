const errors = {
    ALREADY_EXIST: 'Un rôle du même nom existe déjà.',
    NOT_EXIST: 'Ce rôle n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer ce rôle car elle peut-être liée à un utilisateur\nVous pouvez proceder à une suppresion logique ou l\'archivage.',

    LABEL_REQUIRED: "Le libellé est obligatoire.",
    LABEL_MUST_BE_STRING: "Le libellé doit être en texte.",
    
    MODULE_REQUIRED: "Le module est obligatoire.",
    MODULE_MUST_BE_STRING: "Le module doit être en texte.",
    READ_REQUIRED: "La lectutre est obligatoire.",
    READ_MUST_BE_BOOL: "La lectutre doit être en (vrai/faux).",
    WRITE_REQUIRED: "L'écriture est obligatoire.",
    WRITE_MUST_BE_BOOL: "L'écriture doit être en (vrai/faux).",
    REMOVE_REQUIRED: "La suppression est obligatoire.",
    REMOVE_MUST_BE_BOOL: "La suppression doit être en (vrai/faux).",
    ARCHIVE_REQUIRED: "L'archivage est obligatoire.",
    ARCHIVE_MUST_BE_BOOL: "L'archivage doit être en (vrai/faux).",
}
const infos = {

}

export {
    errors,
    infos
}