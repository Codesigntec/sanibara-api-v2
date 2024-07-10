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

    UNIT_PRICE_REQUIRED: "Le prix unitaire est obligatoire.",
    UNIT_PRICE_MUST_BE_NUMBER: "Le prix unitaire doit être un entier.",

    QUANTITY_REQUIRED: "La quantité est obligatoire.",
    QUANTITY_MUST_BE_NUMBER: "La quantité doit être un entier.",

    REFERENCE_REQUIRED: "La reference est obligatoire.",
    REFERENCE_MUST_BE_STRING: "La reference doit être en texte.",

    MATIERE_REQUIRED: "La matière est obligatoire.",
    MATIERE_MUST_BE_STRING: "La matière doit être en texte.",

    MAGASIN_REQUIRED: "Le magasin est obligatoire.",
    MAGASIN_MUST_BE_STRING: "Le magasin doit être en texte.",

    invalid_type_error: "Le champ doit être en texte.",

    INVALID_PAIEMENT: "Les paiements dépassent le montant total de l'achat.",

    ACHAT_NOT_EXIST: "Cet achat n'existe pas ou son ID n'est pas valide\nSi le problème persiste, veuillez contacter Codesign.",
    MONTANT_DEPASSE_RELIQUA: "Le montant du paiement dépasse le reliquat restant",

    PAIEMENT_NOT_EXIST: "Ce paiement n'existe pas ou son ID n'est pas valide\nSi le problème persiste, veuillez contacter Codesign.",

    NOT_EXIST_ACHAT: "Cet achat n'existe pas ou son ID n'est pas valide\nSi le problème persiste, veuillez contacter Codesign.",

    NOT_REMOVABLE_ACHAT: "Vous ne pouvez pas supprimer cet achat car il est lié à un article\nVous pouvez proceder à une suppresion logique ou l'archivage.",

    NOT_EXIST_PAIEMENT: "Ce paiement n'existe pas ou son ID n'est pas valide\nSi le problème persiste, veuillez contacter Codesign.",

    NOT_REMOVABLE_PAIEMENT: "Vous ne pouvez pas supprimer ce paiement car il est lié à un article\nVous pouvez proceder à une suppresion logique ou l'archivage.",

    MONTANT_MUST_BE_NUMBER_CHARGE: "Le montant de la charge doit être un entier.",

    MONTANT_MUST_BE_NUMBER: "Le montant du paiement doit être un entier.",

    MONTANT_REQUIRED: "Le montant est obligatoire.",

    COUT_ERROR: "Le cout est invalide.",

    NOT_EXIST_COUT: "Ce cout n'existe pas ou son ID n'est pas valide\nSi le problème persiste, veuillez contacter Codesign.",

    QUANTITE_ERROR: "La quantité est invalide.",
    
    NOT_EXIST_LIGNE: "Cette ligne n'existe pas ou son ID n'est pas valide\nSi le problème persiste, veuillez contacter Codesign.",

    MONTANT_DEPASSE_MONTANT_A_PAYE: "Les paiements dépassent le montant total de l'achat.",

    MONTANT_PAIEMENT_INVALID : "Invalid or missing 'paiement'",

    MONTANT_COUT_INVALID : "Invalid or missing 'cout.montant'",

    MAGASIN_INVALID: "Invalid or missing 'magasin'",

    MATIERE_INVALID: "Invalid or missing 'matiere'"
}


const infos = {

}

export {
    errors,
    infos
}