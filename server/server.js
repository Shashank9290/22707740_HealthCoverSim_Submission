const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("HealthCoverSim backend is running");
});


// CREATE QUOTE
app.post("/api/quotes", (req, res) => {
  const {
    customer_name,
    cover_type,
    applicant1_age,
    applicant1_cover_history,
    applicant2_age,
    applicant2_cover_history,
    hospital_cover,
    extras_cover,
    payment_frequency,
    annual_discount,
    notes,
  } = req.body;

  const sql = `
    INSERT INTO quotes (
      customer_name,
      cover_type,
      applicant1_age,
      applicant1_cover_history,
      applicant2_age,
      applicant2_cover_history,
      hospital_cover,
      extras_cover,
      payment_frequency,
      annual_discount,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      customer_name,
      cover_type,
      applicant1_age,
      applicant1_cover_history,
      applicant2_age || null,
      applicant2_cover_history || null,
      hospital_cover,
      extras_cover,
      payment_frequency,
      annual_discount,
      notes || null,
    ],
    function (error) {
      if (error) {
        console.error(error.message);

        return res.status(500).json({
          error: "Failed to create quote",
        });
      }

      res.status(201).json({
        message: "Quote created successfully",
        id: this.lastID,
      });
    }
  );
});


// GET ALL QUOTES
app.get("/api/quotes", (req, res) => {
  const sql = "SELECT * FROM quotes ORDER BY id DESC";

  db.all(sql, [], (error, rows) => {
    if (error) {
      console.error(error.message);

      return res.status(500).json({
        error: "Failed to retrieve quotes",
      });
    }

    res.json(rows);
  });
});


// GET ONE QUOTE
app.get("/api/quotes/:id", (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM quotes WHERE id = ?";

  db.get(sql, [id], (error, row) => {
    if (error) {
      console.error(error.message);

      return res.status(500).json({
        error: "Failed to retrieve quote",
      });
    }

    if (!row) {
      return res.status(404).json({
        error: "Quote not found",
      });
    }

    res.json(row);
  });
});


// UPDATE QUOTE
app.put("/api/quotes/:id", (req, res) => {
  const id = req.params.id;

  const {
    customer_name,
    cover_type,
    applicant1_age,
    applicant1_cover_history,
    applicant2_age,
    applicant2_cover_history,
    hospital_cover,
    extras_cover,
    payment_frequency,
    annual_discount,
    notes,
  } = req.body;

  const sql = `
    UPDATE quotes
    SET
      customer_name = ?,
      cover_type = ?,
      applicant1_age = ?,
      applicant1_cover_history = ?,
      applicant2_age = ?,
      applicant2_cover_history = ?,
      hospital_cover = ?,
      extras_cover = ?,
      payment_frequency = ?,
      annual_discount = ?,
      notes = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      customer_name,
      cover_type,
      applicant1_age,
      applicant1_cover_history,
      applicant2_age || null,
      applicant2_cover_history || null,
      hospital_cover,
      extras_cover,
      payment_frequency,
      annual_discount,
      notes || null,
      id,
    ],
    function (error) {
      if (error) {
        console.error(error.message);

        return res.status(500).json({
          error: "Failed to update quote",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Quote not found",
        });
      }

      res.json({
        message: "Quote updated successfully",
      });
    }
  );
});


// DELETE QUOTE
app.delete("/api/quotes/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM quotes WHERE id = ?";

  db.run(sql, [id], function (error) {
    if (error) {
      console.error(error.message);

      return res.status(500).json({
        error: "Failed to delete quote",
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: "Quote not found",
      });
    }

    res.json({
      message: "Quote deleted successfully",
    });
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});