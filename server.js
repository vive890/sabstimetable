const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 5004;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get master timetable
app.get("/api/master-timetable", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('master_timetable')
      .select('*')
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching master timetable:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Update master timetable
app.put("/api/master-timetable", async (req, res) => {
  try {
    const updatedTimetable = req.body;
    
    for (const row of updatedTimetable) {
      const { id, ...updates } = row;
      const { error } = await supabase
        .from('master_timetable')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    }

    // After updating master, update daily timetable
    await resetDailyTimetable();

    res.json({ message: "✅ Master timetable updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating master timetable:", error);
    res.status(500).json({ error: "Database update failed" });
  }
});

// Get tomorrow's timetable
app.get("/api/timetable/tomorrow", async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString("en-US", { weekday: "long" });

    const { data, error } = await supabase
      .from('master_timetable')
      .select('*')
      .eq('day', tomorrowDay)
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching tomorrow's timetable:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Update tomorrow's timetable
app.put("/api/timetable/tomorrow", async (req, res) => {
  try {
    const updatedTimetable = req.body;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString("en-US", { weekday: "long" });
    
    for (const row of updatedTimetable) {
      const { id, ...updates } = row;
      const { error } = await supabase
        .from('master_timetable')
        .update(updates)
        .eq('id', id)
        .eq('day', tomorrowDay);

      if (error) throw error;
    }

    res.json({ message: "✅ Tomorrow's timetable updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating tomorrow's timetable:", error);
    res.status(500).json({ error: "Database update failed" });
  }
});

// Save timetable history
async function saveTimetableHistory() {
  try {
    const date = new Date().toISOString().split('T')[0];
    
    // Check if history exists for today
    const { data: existingHistory } = await supabase
      .from('timetable_history')
      .select('count')
      .eq('date', date)
      .single();

    if (existingHistory?.count > 0) {
      console.log("✅ Timetable history already saved for today");
      return;
    }

    // Get current daily timetable
    const { data: dailyTimetable, error: fetchError } = await supabase
      .from('daily_timetable')
      .select('*');

    if (fetchError) throw fetchError;

    // Save to history
    const { error: insertError } = await supabase
      .from('timetable_history')
      .insert(
        dailyTimetable.map(row => ({
          date,
          course: row.course,
          day: row.day,
          period1: row.period1,
          period2: row.period2,
          period3: row.period3,
          period4: row.period4,
          period5: row.period5,
          period6: row.period6
        }))
      );

    if (insertError) throw insertError;
    console.log("✅ Timetable history saved successfully");
  } catch (error) {
    console.error("❌ Error saving timetable history:", error);
  }
}

// Get timetable history
app.get("/api/timetable/history", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('timetable_history')
      .select('*')
      .order('date', { ascending: false })
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching timetable history:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Get today's timetable
app.get("/api/timetable/today", async (req, res) => {
  try {
    const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
    
    const { data, error } = await supabase
      .from('daily_timetable')
      .select('*')
      .eq('day', currentDay)
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Update today's timetable
app.put("/api/timetable/today", async (req, res) => {
  try {
    const updatedTimetable = req.body;
    
    for (const row of updatedTimetable) {
      const { id, ...updates } = row;
      const { error } = await supabase
        .from('daily_timetable')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    }

    // Save changes to history
    await saveTimetableHistory();

    res.json({ message: "✅ Today's timetable updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating today's timetable:", error);
    res.status(500).json({ error: "Database update failed" });
  }
});

// Reset daily timetable
async function resetDailyTimetable() {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Check last reset
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('name', 'last_timetable_reset')
      .single();

    if (settings?.value === today) {
      return;
    }

    // Save current timetable to history
    await saveTimetableHistory();

    // Clear daily timetable
    const { error: deleteError } = await supabase
      .from('daily_timetable')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) throw deleteError;

    // Copy from master to daily
    const { data: masterData, error: fetchError } = await supabase
      .from('master_timetable')
      .select('*');

    if (fetchError) throw fetchError;

    const { error: insertError } = await supabase
      .from('daily_timetable')
      .insert(masterData.map(({ id, created_at, ...row }) => row));

    if (insertError) throw insertError;

    // Update last reset time
    await supabase
      .from('system_settings')
      .upsert({ name: 'last_timetable_reset', value: today });

  } catch (error) {
    console.error("❌ Error resetting daily timetable:", error);
  }
}

// Initialize reset timer
resetDailyTimetable();
setInterval(resetDailyTimetable, 60000); // Check every minute

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});