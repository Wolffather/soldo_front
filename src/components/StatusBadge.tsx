import { Badge } from 'react-bootstrap';
import type { BookingStatus } from '../types';

interface Props {
  status: BookingStatus;
}

const config: Record<BookingStatus, { bg: string; label: string }> = {
  PENDING: { bg: 'warning', label: 'Ожидает' },
  CONFIRMED: { bg: 'success', label: 'Подтверждено' },
  CANCELLED: { bg: 'danger', label: 'Отменено' },
};

export default function StatusBadge({ status }: Props) {
  const { bg, label } = config[status] ?? { bg: 'secondary', label: status };
  return <Badge bg={bg}>{label}</Badge>;
}