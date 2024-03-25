const express = require("express");
const router = express.Router();
const { query } = require("./db"); 
const db = require('./db');


router.get('/', async (req, res, next) => {
    try {
        const results = await query(`SELECT id, comp_code FROM invoices`);
        return res.json({ invoices: results.rows });
    } catch (e) {
        return next(e);
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Query the database to retrieve the invoice with the specified id
        const result = await query('SELECT * FROM invoices JOIN companies ON invoices.comp_code = companies.code WHERE id = $1', [id]);

        // If the invoice is found, return it
        if (result.rows.length > 0) {
            const invoice = result.rows[0];
            return res.status(200).json({ invoice });
        } else {
            // If the invoice cannot be found, return a 404 status response
            return res.status(404).json({ error: 'Invoice not found' });
        }
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;

        // Insert the new invoice into the database
        const results = await query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);

        // Extract the inserted invoice data from the query results
        const newInvoice = results.rows[0];

        // Return the newly inserted invoice as a response
        return res.status(201).json({ invoice: newInvoice });
    } catch (e) {
        return next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;

        // Check if the invoice exists
        const checkResult = await query('SELECT * FROM invoices WHERE id = $1', [id]);

        if (checkResult.rows.length === 0) {
            // Return 404 if invoice does not exist
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Update the invoice in the database
        const updateResult = await query('UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id]);

        // Return the updated invoice object
        const updatedInvoice = updateResult.rows[0];
        return res.status(200).json({ invoice: updatedInvoice });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the invoice exists
        const checkResult = await query('SELECT * FROM invoices WHERE id = $1', [id]);

        if (checkResult.rows.length === 0) {
            // Return 404 if invoice does not exist
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Delete the invoice from the database
        await query('DELETE FROM invoices WHERE id = $1', [id]);

        return res.status(200).json({ status: 'deleted' });
    } catch (e) {
        return next(e);
    }
});



module.exports = router;
