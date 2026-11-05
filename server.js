require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital',
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ message: 'API and MySQL connected' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Generic CRUD routes for patients and doctors. Table names are allow-listed.
const allowed = {
  patients: ['name', 'email', 'phone', 'gender', 'age'],
  doctors: ['name', 'specialization', 'phone', 'email']
};
for (const [table, fields] of Object.entries(allowed)) {
  app.get(`/api/${table}`, async (req, res) => {
    try {
      let sql = `SELECT * FROM ${table}`;
      const params = [];
      if (table === 'doctors' && req.query.specialization) {
        sql += ' WHERE specialization LIKE ?'; params.push(`%${req.query.specialization}%`);
      }
      sql += ` ORDER BY ${table === 'patients' ? 'patient_id' : 'doctor_id'} DESC`;
      const [rows] = await pool.query(sql, params); res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
  app.post(`/api/${table}`, async (req, res) => {
    try {
      const values = fields.map(f => req.body[f] ?? null);
      const [result] = await pool.query(
        `INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, values
      );
      res.status(201).json({ id: result.insertId, message: 'Record created successfully' });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });
  app.put(`/api/${table}/:id`, async (req, res) => {
    try {
      const sets = fields.filter(f => req.body[f] !== undefined);
      if (!sets.length) return res.status(400).json({ error: 'No fields supplied for update' });
      const values = sets.map(f => req.body[f]);
      values.push(req.params.id);
      const [result] = await pool.query(
        `UPDATE ${table} SET ${sets.map(f => `${f} = ?`).join(', ')} WHERE ${table === 'patients' ? 'patient_id' : 'doctor_id'} = ?`, values
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Record not found' });
      res.json({ message: 'Record updated successfully' });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });
  app.delete(`/api/${table}/:id`, async (req, res) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM ${table} WHERE ${table === 'patients' ? 'patient_id' : 'doctor_id'} = ?`, [req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Record not found' });
      res.json({ message: 'Record deleted successfully' });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });
}

// Appointments CRUD with joined patient/doctor names.
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT a.*, p.name AS patient_name, d.name AS doctor_name,
      d.specialization FROM appointments a
      JOIN patients p ON a.patient_id=p.patient_id
      JOIN doctors d ON a.doctor_id=d.doctor_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, status } = req.body;
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time)
      return res.status(400).json({ error: 'Patient, doctor, date and time are required' });
    const [result] = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, appointment_time, status || 'Pending']);
    res.status(201).json({ id: result.insertId, message: 'Appointment booked successfully' });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const fields = ['patient_id','doctor_id','appointment_date','appointment_time','status'];
    const sets = fields.filter(f => req.body[f] !== undefined);
    if (!sets.length) return res.status(400).json({ error: 'No fields supplied for update' });
    const values = sets.map(f => req.body[f]); values.push(req.params.id);
    const [result] = await pool.query(`UPDATE appointments SET ${sets.map(f => `${f}=?`).join(', ')} WHERE appointment_id=?`, values);
    if (!result.affectedRows) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment updated successfully' });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM appointments WHERE appointment_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hospital system running at http://localhost:${PORT}`));
