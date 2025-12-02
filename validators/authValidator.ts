
import { body } from 'express-validator';

export const registerValidationRules = [
  body('username')
    .notEmpty().withMessage('Le nom d\'utilisateur est requis.')
    .trim()
    .escape(),

  body('email')
    .isEmail().withMessage('Veuillez fournir une adresse e-mail valide.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
];

export const loginValidationRules = [
  body('email')
    .isEmail().withMessage('Veuillez fournir une adresse e-mail valide.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe ne peut pas être vide.')
];
