CREATE DATABASE IF NOT EXISTS hospital;
USE hospital;

CREATE TABLE IF NOT EXISTS patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  gender VARCHAR(10),
  age INT
);

CREATE TABLE IF NOT EXISTS doctors (
  doctor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id)
    REFERENCES patients(patient_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors(doctor_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Optional sample doctors
INSERT IGNORE INTO doctors (doctor_id, name, specialization, phone, email) VALUES
(1, 'Dr. Ananya Rao', 'Cardiology', '9876501001', 'ananya@citycare.com'),
(2, 'Dr. Rahul Sharma', 'Neurology', '9876501002', 'rahul@citycare.com'),
(3, 'Dr. Meera Iyer', 'Dermatology', '9876501003', 'meera@citycare.com');
