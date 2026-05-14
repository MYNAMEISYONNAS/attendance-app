import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [username, setUsername] = useState("teacher");
  const [password, setPassword] = useState("teacher123");

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("Math 7");
  const [date, setDate] = useState("2026-05-14");
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchName, setSearchName] = useState("");

  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  const login = async () => {
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setClasses([]);
    setStudents([]);
    setRecords([]);
  };

  const fetchClasses = async () => {
    const response = await fetch("http://localhost:3001/classes", {
      headers: authHeaders
    });

    const data = await response.json();
    setClasses(data);
  };

  const fetchStudents = async () => {
    const response = await fetch(
      `http://localhost:3001/students?className=${encodeURIComponent(
        selectedClass
      )}`,
      {
        headers: authHeaders
      }
    );

    const data = await response.json();

    setStudents(
      data.map((student) => ({
        ...student,
        status: "Present"
      }))
    );
  };

  const fetchRecords = async () => {
    const response = await fetch("http://localhost:3001/attendance", {
      headers: authHeaders
    });

    const data = await response.json();
    setRecords(data);
  };

  useEffect(() => {
    if (token) {
      fetchClasses();
      fetchRecords();
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedClass) {
      fetchStudents();
    }
  }, [token, selectedClass]);

  const handleStatusChange = (studentId, value) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, status: value } : student
      )
    );
  };

  const submitAttendance = async () => {
    await fetch("http://localhost:3001/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({
        className: selectedClass,
        date,
        students
      })
    });

    alert("Attendance submitted!");
    fetchRecords();
  };

  const updateRecordStatus = async (id, status) => {
    await fetch(`http://localhost:3001/attendance/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({ status })
    });

    fetchRecords();
  };

  const deleteRecord = async (id) => {
    const confirmed = confirm("Delete this attendance record?");
    if (!confirmed) return;

    await fetch(`http://localhost:3001/attendance/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });

    fetchRecords();
  };

  const exportCSV = () => {
    const headers = ["Teacher", "Class", "Student", "Status", "Date"];

    const rows = filteredRecords.map((record) => [
      record.teacher,
      record.class_name,
      record.student_name,
      record.status,
      record.date
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const filteredRecords = records.filter((record) => {
    const matchesClass = filterClass ? record.class_name === filterClass : true;
    const matchesStatus = filterStatus ? record.status === filterStatus : true;
    const matchesDate = filterDate ? record.date === filterDate : true;
    const matchesName = searchName
      ? record.student_name.toLowerCase().includes(searchName.toLowerCase())
      : true;

    return matchesClass && matchesStatus && matchesDate && matchesName;
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Attendance Login
          </h1>

          <p className="text-gray-500 mb-6">
            Sign in to manage attendance records.
          </p>

          <div className="space-y-4">
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Log In
            </button>
          </div>

          <div className="text-sm text-gray-500 mt-6">
            Test accounts:
            <div>teacher / teacher123</div>
            <div>admin / admin123</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Attendance Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Logged in as {user?.teacherName} ({user?.role})
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-3 rounded-xl"
          >
            Log Out
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Take Attendance</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>

              <select
                className="w-full border rounded-xl p-3"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>

              <input
                type="date"
                className="w-full border rounded-xl p-3"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-xl"
              >
                <span className="font-medium">{student.name}</span>

                <select
                  className="border rounded-lg p-2"
                  value={student.status}
                  onChange={(e) =>
                    handleStatusChange(student.id, e.target.value)
                  }
                >
                  <option>Present</option>
                  <option>Absent</option>
                  <option>Tardy</option>
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={submitAttendance}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            Submit Attendance
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Attendance Records</h2>

            <button
              onClick={exportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl"
            >
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              placeholder="Search student..."
              className="border rounded-xl p-3"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />

            <select
              className="border rounded-xl p-3"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>

              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>

            <select
              className="border rounded-xl p-3"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Tardy</option>
            </select>

            <input
              type="date"
              className="border rounded-xl p-3"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="p-4">{record.teacher}</td>
                    <td className="p-4">{record.class_name}</td>
                    <td className="p-4">{record.student_name}</td>
                    <td className="p-4">
                      <select
                        className="border rounded-lg p-2"
                        value={record.status}
                        onChange={(e) =>
                          updateRecordStatus(record.id, e.target.value)
                        }
                      >
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Tardy</option>
                      </select>
                    </td>
                    <td className="p-4">{record.date}</td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <p className="text-gray-500 mt-6">No records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;