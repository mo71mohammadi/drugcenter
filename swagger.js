/**
 * @swagger
 * /api/products/getAll:
 *  post:
 *    summary: Get all product.
 *    parameters:
 *     - in: body
 *       name: products
 *       schema:
 *         type: object
 *         properties:
 *           size:
 *             type: integer
 *           page:
 *             type: integer
 *    responses:
 *      '200':
 *        description: A successful response
 */

/**
 * @swagger
 * /api/products/getOne:
 *  post:
 *    summary: Get one product.
 *    parameters:
 *     - in: body
 *       name: product
 *       schema:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */

/**
 * @swagger
 * /api/products/create:
 *  post:
 *    summary: create product.
 *    parameters:
 *     - in: body
 *       name: product
 *       schema:
 *         type: object
 *         properties:
 *           eRx:
 *             type: string
 *           packageCode:
 *             type: string
 *           eRxGeneric:
 *             type: string
 *           genericCode:
 *             type: integer
 *           packageCount:
 *             type: integer
 *           enGenericName:
 *             type: string
 *           faGenericName:
 *             type: string
 *           enBrandName:
 *             type: string
 *           faBrandName:
 *             type: string
 *           licenceOwner:
 *             type: string
 *           brandOwner:
 *             type: string
 *           producer:
 *             type: string
 *           countryBrandOwner:
 *             type: string
 *           countryProducer:
 *             type: string
 *           gtn:
 *             type: string
 *           irc:
 *             type: string
 *           category:
 *             type: string
 *           nativeIrc:
 *             type: string
 *           cName:
 *             type: string
 *           image:
 *             type: string
 *    responses:
 *      '200':
 *        description: A successful response
 *      '401':
 *        description: product validation failed
 */

/**
 * @swagger
 * /api/products/update:
 *  post:
 *    summary: update product.
 *    parameters:
 *     - in: body
 *       name: product
 *       schema:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           eRx:
 *             type: string
 *           packageCode:
 *             type: string
 *           eRxGeneric:
 *             type: string
 *           genericCode:
 *             type: integer
 *           packageCount:
 *             type: integer
 *           enGenericName:
 *             type: string
 *           faGenericName:
 *             type: string
 *           enBrandName:
 *             type: string
 *           faBrandName:
 *             type: string
 *           licenceOwner:
 *             type: string
 *           brandOwner:
 *             type: string
 *           producer:
 *             type: string
 *           countryBrandOwner:
 *             type: string
 *           countryProducer:
 *             type: string
 *           gtn:
 *             type: string
 *           irc:
 *             type: string
 *           category:
 *             type: string
 *           nativeIrc:
 *             type: string
 *           cName:
 *             type: string
 *           image:
 *             type: string
 *    responses:
 *      '200':
 *        description: A successful response
 *      '401':
 *        description: product validation failed
 */

/**
 * @swagger
 * /api/products/delete:
 *  post:
 *    summary: delete product.
 *    parameters:
 *     - in: body
 *       name: product
 *       schema:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */

/**
 * @swagger
 * /api/products/updatePrice:
 *  post:
 *    summary: add Price product.
 *    parameters:
 *     - in: body
 *       name: product
 *       schema:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           sPrice:
 *             type: integer
 *           dPrice:
 *             type: integer
 *           cPrice:
 *             type: integer
 *    responses:
 *      '200':
 *        description: A successful response
 */

/**
 * @swagger
 * /api/products/deletePrice:
 *  post:
 *    summary: delete Price product.
 *    parameters:
 *     - in: body
 *       name: product
 *       schema:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           priceId:
 *             type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
