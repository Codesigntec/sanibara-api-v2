const errors = {
    REFERENCE_ALREADY_EXIST: 'Une production de même référence existe déjà.',
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
    DESCRIPTION_MUST_BE_STRING: "La description doit être en texte.",
    REFERENCE_MUST_BE_STRING: 'La référence doit être en texte.',
    ID_MUST_BE_STRING: 'id doit être en texte.',
    DATE_DEBUT_MUST_BE_DATE: 'DateDebut doit être une date valide.',
    DATE_FIN_MUST_BE_DATE: 'DateFin doit être une date valide.',
    PU_GROS_MUST_BE_NUMBER: 'pu_gros doit être un nombre.',
    PU_DETAIL_MUST_BE_NUMBER: 'pu_detail doit être un nombre.',
    DATE_PEREMPTION_MUST_BE_DATE: 'datePeremption doit être une date valide.',
    QT_PRODUIT_MUST_BE_NUMBER: 'qt_produit doit être un nombre.',
    PRODUIT_FIN_ID_MUST_BE_STRING: 'produitFini.id doit être en texte.',
    MAGASIN_ID_MUST_BE_STRING: 'magasin.id doit être en texte.',
    PRODUCTION_LIGNE_ACHAT_ID_MUST_BE_STRING: 'productionLigneAchat.id doit être en texte.',
    DATE_DEBUT_MUST_BE_BEFORE_DATE_FIN: 'La date de fin ne peut pas être inferieur à la date de debut.',
    NOT_EXIST: 'Cette production n\'existe pas ou son ID n\'est pas valide\nSi le problème persiste, veuillez contacter Codesign.',
    NOT_STOCK_EXIST: 'Cet article n\'est plus en stock.',
    NOT_LIGNE_EXIST: 'Cette ligne d\'achat n\'existe pas ou son ID n\'est pas valid, si le problème persiste, veuillez contacter Codesign.',
  };
  
  
const infos = {

}

export {
    errors,
    infos
}