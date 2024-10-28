const errors = {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
    PAYE_SUPPERIEUR_MONTANT: "Le montant de la vente ne doit pas être superieur au montant de la facture.",
    DATE_VENTE_INVALIDE: "La date de la vente n'est pas valide.",
    STOCK_NOT_FOUND: "Le stock n'existe pas ou son ID n'est pas valide.",
    QUANTITE_INSUFFISANTE: "La quantité de la vente est inferieur à la quantité de stock.",
    QUANTITE_NON_VALID: "La quantité de la vente n'est pas valide.",
    NOT_PRODUI_FINI_EXIST: "Le produit n'existe pas ou son ID n'est pas valide.",
    MONTANT_REQUIRED: "Le montant est obligatoire.",
    MONTANT_DOIT_ETRE_NOMBRE: "Le montant doit être un nombre.",
    NOT_VENTE_EXIST: "La vente n'existe pas ou son ID n'est pas valide.",
    NOT_REMOVABLE: 'Vous ne pouvez pas supprimer cette vente car elle peut être liée à un article\nVous pouvez proceder à une suppresion logique ou l\'archivage.',
    TVA_REQUIRED: "La tva est obligatoire.",
    MONTANT_MUST_BE_NUMBER: "Le montant du paiement doit être un entier.",
    MONTANT_DEPASSE_RELIQUA: "Le montant de la vente dépasse le reliquat restant.",
    PAIEMENT_NOT_EXIST: "Ce paiement n'existe pas ou son ID n'est pas valide.",
    NOT_EXIST_PAIEMENT: "Ce paiement n'existe pas ou son ID n'est pas valide.",
    NOT_REMOVABLE_PAIEMENT: "Vous ne pouvez pas supprimer ce paiement car il est lié à un article.",
    REFERENCES_MUST_BE_STRING: "La reference doit être en texte.",
    TVA_MUST_BE_NUMBER: "La tva doit être un nombre.",
}
const infos = {

}
export {
    errors,
    infos
}