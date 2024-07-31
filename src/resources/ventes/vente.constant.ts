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
}
const infos = {

}

export {
    errors,
    infos
}