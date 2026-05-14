const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./attendance.db");
const JWT_SECRET = "dev-secret-change-later";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      teacher_name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher TEXT,
      class_name TEXT,
      date TEXT,
      student_id INTEGER,
      student_name TEXT,
      status TEXT,
      submitted_at TEXT
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM students", (err, row) => {
    if (!err && row.count === 0) {
      const students = [
        ["Aaliyah Brown", "Math 7"],
        ["Diego Martinez", "Math 7"],
        ["Maya Johnson", "Math 7"],
        ["Ethan Wilson", "Science 7"],
        ["Sofia Garcia", "Science 7"],
        ["Noah Smith", "Science 7"]
      ];

      students.forEach(([name, className]) => {
        db.run(
          "INSERT INTO students (name, class_name) VALUES (?, ?)",
          [name, className]
        );
      });
    }
  });

  db.get("SELECT COUNT(*) AS count FROM users", async (err, row) => {
    if (!err && row.count === 0) {
      const teacherPassword = await bcrypt.hash("teacher123", 10);
      const adminPassword = await bcrypt.hash("admin123", 10);

      db.run(
        "INSERT INTO users (username, password_hash, role, teacher_name) VALUES (?, ?, ?, ?)",
        ["teacher", teacherPassword, "teacher", "Ms. Rivera"]
      );

      db.run(
        "INSERT INTO users (username, password_hash, role, teacher_name) VALUES (?, ?, ?, ?)",
        ["admin", adminPassword, "admin", "Admin User"]
      );
    }
  });
});

app.get("/", (req, res) => {
  res.send("Attendance API is running");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const passwordMatches = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          teacherName: user.teacher_name
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          teacherName: user.teacher_name
        }
      });
    }
  );
});

app.get("/classes", authenticateToken, (req, res) => {
  db.all(
    "SELECT DISTINCT class_name FROM students ORDER BY class_name",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map((row) => row.class_name));
    }
  );
});

app.get("/students", authenticateToken, (req, res) => {
  const className = req.query.className;

  db.all(
    "SELECT * FROM students WHERE class_name = ? ORDER BY name",
    [className],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post("/attendance", authenticateToken, (req, res) => {
  const { className, date, students } = req.body;
  const submittedAt = new Date().toISOString();
  const teacher = req.user.teacherName;

  students.forEach((student) => {
    db.run(
      `
      INSERT INTO attendance_records
      (teacher, class_name, date, student_id, student_name, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        teacher,
        className,
        date,
        student.id,
        student.name,
        student.status,
        submittedAt
      ]
    );
  });

  res.json({ message: "Attendance saved successfully" });
});

app.get("/attendance", authenticateToken, (req, res) => {
  db.all(
    "SELECT * FROM attendance_records ORDER BY submitted_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.put("/attendance/:id", authenticateToken, (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  db.run(
    "UPDATE attendance_records SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Attendance record updated",
        changes: this.changes
      });
    }
  );
});

app.delete("/attendance/:id", authenticateToken, (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM attendance_records WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: "Attendance record deleted",
      changes: this.changes
    });
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});