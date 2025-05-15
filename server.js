const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 5004;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "hopper.proxy.rlwy.net",
    port: 26036,
    user: "root",
    password: "NFgBQAasPKmFSqJEiPOkKvdnOMVsMMGo",
    database: "railway"
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

// Get master timetable
app.get("/api/master-timetable", (req, res) => {
    const sql = "SELECT * FROM master_timetable ORDER BY id";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error fetching master timetable:", err);
            res.status(500).json({ error: "Database query failed" });
        } else {
            res.json(results);
        }
    });
});

// Update master timetable
app.put("/api/master-timetable", (req, res) => {
    const updatedTimetable = req.body;

    const promises = updatedTimetable.map(row => {
        return new Promise((resolve, reject) => {
            const { id, ...columns } = row;
            const columnNames = Object.keys(columns);
            const columnValues = Object.values(columns);

            let query = `UPDATE master_timetable SET ${columnNames.map(col => `${col} = ?`).join(", ")} WHERE id = ?`;
            let values = [...columnValues, id];

            db.query(query, values, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json({ message: "✅ Master timetable updated successfully!" });
        })
        .catch(error => {
            console.error("❌ Error updating master timetable:", error);
            res.status(500).json({ error: "Database update failed" });
        });
});

// Get tomorrow's timetable
app.get("/api/timetable/tomorrow", (req, res) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString("en-US", { weekday: "long" });

    const sql = "SELECT * FROM master_timetable WHERE day = ? ORDER BY id";
    db.query(sql, [tomorrowDay], (err, results) => {
        if (err) {
            console.error("❌ Error fetching tomorrow's timetable:", err);
            res.status(500).json({ error: "Database query failed" });
        } else {
            res.json(results);
        }
    });
});

// Save timetable history
function saveTimetableHistory() {
    const date = new Date().toISOString().split('T')[0];
    
    db.query("SELECT COUNT(*) as count FROM timetable_history WHERE date = ?", [date], (err, result) => {
        if (err) {
            console.error("❌ Error checking timetable history:", err);
            return;
        }

        if (result[0].count > 0) {
            console.log("✅ Timetable history already saved for today");
            return;
        }

        const insertSql = `
            INSERT INTO timetable_history (date, course, day, period1, period2, period3, period4, period5, period6)
            SELECT ? as date, course, day, period1, period2, period3, period4, period5, period6 
            FROM daily_timetable
        `;

        db.query(insertSql, [date], (err) => {
            if (err) {
                console.error("❌ Error saving timetable history:", err);
            } else {
                console.log("✅ Timetable history saved successfully");
            }
        });
    });
}

// Get timetable history
app.get("/api/timetable/history", (req, res) => {
    const sql = "SELECT * FROM timetable_history ORDER BY date DESC, id";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error fetching timetable history:", err);
            res.status(500).json({ error: "Database query failed" });
        } else {
            res.json(results);
        }
    });
});

app.post("/api/staff-login", (req, res) => {
    const { passcode } = req.body;

    const sql = "SELECT * FROM staff WHERE passcode = ?";
    db.query(sql, [passcode], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

app.post("/api/admin-login", (req, res) => {
    const { passcode } = req.body;

    if (!passcode) {
        return res.status(400).json({ error: "Passcode is required" });
    }

    const sql = "SELECT * FROM admin WHERE passcode = ?";
    db.query(sql, [passcode], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            res.status(500).json({ error: "Database query failed" });
            return;
        }

        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

// Get today's timetable
app.get("/api/timetable/today", (req, res) => {
    const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const sql = "SELECT * FROM daily_timetable WHERE day = ? ORDER BY id";
    
    db.query(sql, [currentDay], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            res.status(500).json({ error: "Database query failed" });
        } else {
            res.json(results);
        }
    });
});

// Reset daily timetable
function resetDailyTimetable() {
    const today = new Date().toISOString().split("T")[0];
    
    db.query("SELECT value FROM system_settings WHERE name = 'last_timetable_reset'", (err, result) => {
        if (err) {
            console.error("❌ Error checking last_timetable_reset:", err);
            return;
        }

        const lastReset = result.length > 0 ? result[0].value : null;

        if (lastReset === today) {
            return;
        }

        // Save current timetable to history before resetting
        saveTimetableHistory();

        // Clear and reset daily_timetable
        db.query("DELETE FROM daily_timetable", (err) => {
            if (err) {
                console.error("❌ Error clearing daily_timetable:", err);
                return;
            }

            db.query("ALTER TABLE daily_timetable AUTO_INCREMENT = 1", (err) => {
                if (err) {
                    console.error("❌ Error resetting AUTO_INCREMENT:", err);
                    return;
                }

                const copySql = `
                    INSERT INTO daily_timetable (course, day, period1, period2, period3, period4, period5, period6)
                    SELECT course, day, period1, period2, period3, period4, period5, period6 FROM master_timetable
                `;
                
                db.query(copySql, (err) => {
                    if (err) {
                        console.error("❌ Error copying from master_timetable:", err);
                        return;
                    }

                    db.query(
                        "INSERT INTO system_settings (name, value) VALUES ('last_timetable_reset', ?) ON DUPLICATE KEY UPDATE value = ?",
                        [today, today]
                    );
                });
            });
        });
    });
}

// Initialize reset timer
resetDailyTimetable();
setInterval(resetDailyTimetable, 60000); // Check every minute

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});