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
  const [grantingAdmin, setGrantingAdmin] = useState<number | null>(null);

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

  const handleGrantAdmin = async (user: User) => {
    if (user.role === 'ADMIN') return;
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || `#${user.id}`;
    if (!confirm(`Выдать права администратора пользователю ${name}?`)) return;
    setGrantingAdmin(user.id);
    try {
      const updated = await userApi.grantAdminRole(user.id);
      setUsers((us) => us.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Ошибка при выдаче прав');
    } finally {
      setGrantingAdmin(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const roleBadge = (role: string) => {
    const variants: Record<string, string> = {
      ADMIN: 'danger',
      MODERATOR: 'warning',
      USER: 'primary',
    };
    return <Badge bg={variants[role] ?? 'secondary'}>{role}</Badge>;
  };

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
        <h4 className="mb-0">Пользователи ({filteredUsers.length}{q ? ` из ${users.length}` : ''})</h4>
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
                <th>Роль</th>
                <th>Дата регистрации</th>
                <th></th>
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
                  <td>{roleBadge(user.role)}</td>
                  <td className="text-muted">
                    {user.createdAt ? formatDateTime(user.createdAt) : '—'}
                  </td>
                  <td>
                    {user.role !== 'ADMIN' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleGrantAdmin(user)}
                        disabled={grantingAdmin === user.id}
                      >
                        {grantingAdmin === user.id ? '...' : 'Сделать админом'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    {q ? 'Пользователи не найдены' : 'Нет пользователей'}
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
