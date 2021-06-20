/**
 * @swagger
 * tags:
 * - name: "Product"
 *   description: "Everything about Product"
 *   externalDocs:
 *    description: "Find out more"
 *    url: "http://swagger.io"
 * - name: "Category"
 *   description: "Everything about Category"
 * schemes:
 * - "https"
 * - "http"
 *
 * /api/products/getAll:
 *  post:
 *    tags:
 *    - "Product"
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
 *    tags:
 *    - "Product"
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
 *    tags:
 *    - "Product"
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
 *    tags:
 *    - "Product"
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
 *    tags:
 *    - "Product"
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
 *    tags:
 *    - "Product"
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
 *    tags:
 *    - "Product"
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
