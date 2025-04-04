const express = require('express');
const router = express.Router();
const productModel = require('../models/productModel');
// Middleware for validating product input
// This middleware ensures that the incoming request body contains valid product data.
// It checks for the presence and validity of the `name`, `price`, and `category` fields.
// If any of these fields are missing or invalid, it responds with a 400 status code and an error message.
// Otherwise, it calls `next()` to pass control to the next middleware or route handler.
const validateProduct = (req, res, next) => {
    const { name, price, category } = req.body; // Destructure the product fields from the request body
    const errors = []; // Initialize an array to collect validation errors

    // Check if the `name` field is provided and not empty
    if (!name || name.trim() === '') {
        errors.push('Product name is required');
    }

    // Check if the `price` field is provided, is a number, and is greater than 0
    if (!price || isNaN(price) || price <= 0) {
        errors.push('Product price must be a positive number');
    }

    // Check if the `category` field is provided and not empty
    if (!category || category.trim() === '') {
        errors.push('Product category is required');
    }

    // If there are any validation errors, respond with a 400 status and the errors
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // If validation passes, proceed to the next middleware or route handler
    next();
};

// GET all products
// This route handler retrieves all products from the database.
// It uses the `getAllProducts` method from the `productModel` to fetch the data.
// If successful, it responds with a JSON array of all products.
// If an error occurs (e.g., database connection issue), it responds with a 500 status code and an error message.
router.get('/', async (req, res) => {
    try {
        const products = await productModel.getAllProducts(); // Fetch all products from the database
        res.json(products); // Respond with the products as a JSON array
    } catch (err) {
        // Handle any errors that occur during the database operation
        res.status(500).json({ error: 'Failed to retrieve products' });
    }
});

// GET a single product by ID
// This route handler retrieves a specific product by its ID from the database.
// It uses the `getProductById` method from the `productModel` to fetch the product.
// If the product is found, it responds with the product data as JSON.
// If the product is not found, it responds with a 404 status code and an error message.
// If an error occurs (e.g., database connection issue), it responds with a 500 status code and an error message.
router.get('/:id', async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.id); // Fetch the product by ID

        // If no product is found, respond with a 404 status and an error message
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product); // Respond with the product data as JSON
    } catch (err) {
        // Handle any errors that occur during the database operation
        res.status(500).json({ error: 'Failed to retrieve product' });
    }
});

// POST create a new product
router.post('/', validateProduct, async (req, res) => { 
    // Defines a POST route at the root path ('/') of the products endpoint.
    // The `validateProduct` middleware is executed first to validate the incoming data.
    // The `async` keyword allows the use of `await` for asynchronous operations.

    try {
        const newProduct = await productModel.createProduct(req.body);
        // Calls the `createProduct` method from the `productModel` to add a new product to the database.
        // The `req.body` contains the data sent by the client in the request body (e.g., product name, price, category).
        // The `await` ensures the code waits for the database operation to complete before proceeding.

        res.status(201).json(newProduct);
        // Sends a response back to the client with a status code of 201 (Created).
        // The `json(newProduct)` sends the newly created product data as a JSON object in the response.

    } catch (err) {
        res.status(500).json({ error: 'Failed to create product' });
        // If an error occurs during the database operation, this block is executed.
        // Sends a response with a status code of 500 (Internal Server Error) and an error message in JSON format.
    }
});

// PUT update a product
router.put('/:id', validateProduct, async (req, res) => { 
    // Defines a PUT route for updating a product.
    // The `:id` is a placeholder for the product's unique identifier, provided in the URL.
    // The `validateProduct` middleware is executed first to validate the incoming data.
    // The `async` keyword allows the use of `await` for asynchronous operations.

    try {
        const updatedProduct = await productModel.updateProduct(req.params.id, req.body);
        // Calls the `updateProduct` method from the `productModel` to update the product in the database.
        // `req.params.id` retrieves the product ID from the URL (e.g., `/products/123` would extract `123`).
        // `req.body` contains the updated product data sent by the client in the request body.

        if (!updatedProduct) {
            // Checks if the `updateProduct` method returned `null` or `undefined`, meaning the product was not found.
            return res.status(404).json({ error: 'Product not found' });
            // Sends a response with a status code of 404 (Not Found) and an error message in JSON format.
        }

        res.json(updatedProduct);
        // Sends a response back to the client with the updated product data as a JSON object.

    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
        // If an error occurs during the database operation, this block is executed.
        // Sends a response with a status code of 500 (Internal Server Error) and an error message in JSON format.
    }
});

// DELETE a product
router.delete('/:id', async (req, res) => { 
    // Defines a DELETE route for removing a product.
    // The `:id` is a placeholder for the product's unique identifier, provided in the URL.
    // The `async` keyword allows the use of `await` for asynchronous operations.

    try {
        const success = await productModel.deleteProduct(req.params.id);
        // Calls the `deleteProduct` method from the `productModel` to delete the product from the database.
        // `req.params.id` retrieves the product ID from the URL (e.g., `/products/123` would extract `123`).
        // The `await` ensures the code waits for the database operation to complete before proceeding.

        if (!success) {
            // Checks if the `deleteProduct` method returned `false` or `null`, meaning the product was not found.
            return res.status(404).json({ error: 'Product not found' });
            // Sends a response with a status code of 404 (Not Found) and an error message in JSON format.
        }

        res.status(204).end();
        // Sends a response back to the client with a status code of 204 (No Content).
        // The `.end()` method is used to indicate that the response has no body content.

    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
        // If an error occurs during the database operation, this block is executed.
        // Sends a response with a status code of 500 (Internal Server Error) and an error message in JSON format.
    }
});

module.exports = router;