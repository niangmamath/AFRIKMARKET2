
import { body } from 'express-validator';

export const profileUpdateValidationRules = [
  body('username')
    .notEmpty().withMessage('Le nom d\'utilisateur est requis.')
    .trim()
    .escape(),

  body('email')
    .isEmail().withMessage('Veuillez fournir une adresse e-mail valide.')
    .normalizeEmail()
];
