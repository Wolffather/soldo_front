import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

export default function NotFound() {
  return (
    <Container className="text-center py-5">
      <h1 className="display-1 text-muted">404</h1>
      <p className="lead">Страница не найдена</p>
      <Link to="/">
        <Button variant="primary">На главную</Button>
      </Link>
    </Container>
  );
}