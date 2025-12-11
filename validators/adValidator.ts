
import { body } from 'express-validator';

const CATEGORIES = ['Immobilier', 'Véhicules', 'Maison & Jardin', 'Électronique', 'Loisirs', 'Mode', 'Autres', 'Vêtements & Mode'];

export const adValidationRules = [
  body('title')
    .notEmpty().withMessage('Le titre est requis.')
    .trim(),

  body('description')
    .notEmpty().withMessage('La description est requise.')
    .trim(),

  body('price')
    .notEmpty().withMessage('Le prix est requis.')
    .isNumeric().withMessage('Le prix doit être une valeur numérique.'),

  body('category')
    .notEmpty().withMessage('La catégorie est requise.')
    .isIn(CATEGORIES).withMessage('Catégorie invalide.')
];
