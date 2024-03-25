const express = require("express");
const router = express.Router();
const { query } = require("./db"); 
const db = require('./db');



router.get('/', async (req, res, next) => {
    try {
        const results = await query(`SELECT * FROM companies`);
        return res.json(results.rows);
    }   catch (e) {
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        // Query the database to retrieve the company with the specified code
        const result = await query('SELECT * FROM companies LEFT JOIN invoices ON companies.code = invoices.comp_code WHERE code = $1', [code]);

        // If the company is found, return it
        if (result.rows.length > 0) {
            const companyData = result.rows[0];
            const company = {
                code: companyData.code,
                name: companyData.name,
                description: companyData.description,
                invoices: result.rows.filter(row => row.id).map(row => row.id)
            };
            return res.status(200).json({ company });
        } else {
            // If the company cannot be found, return a 404 status response
            return res.status(404).json({ error: 'Company not found' });
        }
    } catch (e) {
        return next(e);
    }
});




router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;

        // Insert the new company into the database
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);

        // Extract the inserted company data from the query results
        const newCompany = results.rows[0];

        // Return the newly inserted company as a response
        return res.status(201).json({ company: newCompany });
    } catch (e) {
        return next(e);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        // Check if the company exists
        const checkResult = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

        if (checkResult.rows.length === 0) {
            // Return 404 if company does not exist
            return res.status(404).json({ error: 'Company not found' });
        }

        // Update the company in the database
        const updateResult = await db.query('UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description', [name, description, code]);

        // Return the updated company object
        const updatedCompany = updateResult.rows[0];
        return res.status(200).json({ company: updatedCompany });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        // Check if the company exists
        const checkResult = await query('SELECT * FROM companies WHERE code = $1', [code]);

        if (checkResult.rows.length === 0) {
            // Return 404 if company does not exist
            return res.status(404).json({ error: 'Company not found' });
        }

        // Delete the company from the database
        await query('DELETE FROM companies WHERE code = $1', [code]);

        return res.status(200).json({ status: 'deleted' });
    } catch (e) {
        return next(e);
    }
});



module.exports = router;
