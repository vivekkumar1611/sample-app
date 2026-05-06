import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://YOUR_API_ID.execute-api.eu-north-1.amazonaws.com/prod";

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users`);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    await axios.post(`${API}/users`, { name, email });
    setName("");
    setEmail("");
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await axios.delete(`${API}/users/${id}`);
    fetchUsers();
  };

  return (
    <div style={styles.container}>
      <h1>3-Tier User Management</h1>

      <div style={styles.form}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={addUser}>Add</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <button onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: 30, fontFamily: "Arial" },
  form: { marginBottom: 20, display: "flex", gap: 10 },
  table: { width: "100%", borderCollapse: "collapse" },
};
