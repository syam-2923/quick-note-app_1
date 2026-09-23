const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

console.log("=================================");
console.log("🚀 Quick Note Application");
console.log("=================================");

// Database connection
const db = new sqlite3.Database("./notes.db", (err) => {
    if (err) {
        console.log("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Database connected successfully");
    }
});

// Create table
db.run(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        favourite INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.log("❌ Table creation failed:", err.message);
    } else {
        console.log("✅ Notes table ready");
    }
});


// ===============================
// GET ALL NOTES
// ===============================

app.get("/api/notes", (req, res) => {

    console.log("📥 GET /api/notes");

    db.all(
        "SELECT * FROM notes ORDER BY favourite DESC, id DESC",
        [],
        (err, rows) => {

            if (err) {
                console.log("❌ Error loading notes:", err.message);

                return res.status(500).json({
                    error: "Failed to load notes"
                });
            }

            console.log(`✅ ${rows.length} note(s) loaded`);

            res.json(rows);
        }
    );
});


// ===============================
// ADD NOTE
// ===============================

app.post("/api/notes", (req, res) => {

    const { content } = req.body;

    console.log("📤 POST /api/notes");

    if (!content || content.trim() === "") {

        console.log("⚠️ Empty note received");

        return res.status(400).json({
            error: "Note cannot be empty"
        });
    }

    db.run(
        "INSERT INTO notes (content, favourite) VALUES (?, ?)",
        [content.trim(), 0],
        function (err) {

            if (err) {

                console.log("❌ Error saving note:", err.message);

                return res.status(500).json({
                    error: "Failed to save note"
                });
            }

            console.log(`✅ Note saved! ID: ${this.lastID}`);

            res.json({
                message: "Note saved successfully",
                id: this.lastID
            });
        }
    );
});


// ===============================
// DELETE NOTE
// ===============================

app.delete("/api/notes/:id", (req, res) => {

    const id = req.params.id;

    console.log(`🗑️ DELETE /api/notes/${id}`);

    db.run(
        "DELETE FROM notes WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                console.log("❌ Error deleting note:", err.message);

                return res.status(500).json({
                    error: "Failed to delete note"
                });
            }

            if (this.changes === 0) {

                console.log("⚠️ Note not found");

                return res.status(404).json({
                    error: "Note not found"
                });
            }

            console.log(`✅ Note ${id} deleted successfully`);

            res.json({
                message: "Note deleted successfully"
            });
        }
    );
});


// ===============================
// FAVOURITE / UNFAVOURITE
// ===============================

app.put("/api/notes/:id/favourite", (req, res) => {

    const id = req.params.id;

    console.log(`⭐ Favourite button clicked for note ${id}`);

    db.get(
        "SELECT favourite FROM notes WHERE id = ?",
        [id],
        (err, row) => {

            if (err) {

                console.log("❌ Error finding note:", err.message);

                return res.status(500).json({
                    error: "Database error"
                });
            }

            if (!row) {

                console.log("⚠️ Note not found");

                return res.status(404).json({
                    error: "Note not found"
                });
            }

            // Change 0 → 1
            // Change 1 → 0
            const newFavourite = row.favourite === 0 ? 1 : 0;

            db.run(
                "UPDATE notes SET favourite = ? WHERE id = ?",
                [newFavourite, id],
                function (err) {

                    if (err) {

                        console.log(
                            "❌ Error updating favourite:",
                            err.message
                        );

                        return res.status(500).json({
                            error: "Failed to update favourite"
                        });
                    }

                    if (newFavourite === 1) {

                        console.log(`⭐ Note ${id} added to favourites`);

                    } else {

                        console.log(`☆ Note ${id} removed from favourites`);
                    }

                    res.json({
                        message: "Favourite updated",
                        favourite: newFavourite
                    });
                }
            );
        }
    );
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log("---------------------------------");
    console.log(`🌐 Server running at http://localhost:${PORT}`);
    console.log("📂 Frontend folder: public");
    console.log("🗄️ Database: notes.db");
    console.log("---------------------------------");
});