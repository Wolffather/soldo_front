import { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Alert, Form, InputGroup, Button } from 'react-bootstrap';
import { userApi } from '../api/userApi';
import type { User } from '../types';
import { formatDateTime } from '../utils/format';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const q = search.toLowerCase().trim();
  const filteredUsers = q
    ? users.filter(
        (u) =>
          u.id.toString().includes(q) ||
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      )
    : users;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0">Администраторы ({filteredUsers.length}{q ? ` из ${users.length}` : ''})</h4>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
        <InputGroup.Text>🔍</InputGroup.Text>
        <Form.Control
          placeholder="Поиск по имени, username, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => setSearch('')}>✕</Button>
        )}
      </InputGroup>

      <Card>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Username</th>
                <th>Email / Телефон</th>
                <th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="text-muted">{user.id}</td>
                  <td>
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td>{user.username ? `@${user.username}` : '—'}</td>
                  <td>
                    <small>
                      {user.email && <div>{user.email}</div>}
                      {user.phone && <div className="text-muted">{user.phone}</div>}
                      {!user.email && !user.phone && '—'}
                    </small>
                  </td>
                  <td className="text-muted">
                    {user.createdAt ? formatDateTime(user.createdAt) : '—'}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    {q ? 'Не найдено' : 'Нет администраторов'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
