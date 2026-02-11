import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Joi schema
 */
export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const { error, value } = schema.validate(req[property], {
                abortEarly: false,
                stripUnknown: true,
            });

            if (error) {
                const errorMessage = error.details
                    .map((detail) => detail.message)
                    .join(', ');
                throw new ValidationError(errorMessage);
            }

            // Replace request property with validated value
            req[property] = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Validate request body
 */
export const validateBody = (schema: Schema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = (schema: Schema) => validate(schema, 'query');

/**
 * Validate route parameters
 */
export const validateParams = (schema: Schema) => validate(schema, 'params');
