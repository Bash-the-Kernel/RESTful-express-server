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
    try {
        const newProduct = await productModel.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT update a product
router.put('/:id', validateProduct, async (req, res) => {
    try {
        const updatedProduct = await productModel.updateProduct(req.params.id, req.body);

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
    try {
        const success = await productModel.deleteProduct(req.params.id);

        if (!success) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;