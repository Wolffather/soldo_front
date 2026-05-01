import { Pagination as BsPagination } from 'react-bootstrap';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <BsPagination className="justify-content-center mt-3">
      <BsPagination.First onClick={() => onPageChange(0)} disabled={currentPage === 0} />
      <BsPagination.Prev
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      />

      {pages.map((p) => (
        <BsPagination.Item key={p} active={p === currentPage} onClick={() => onPageChange(p)}>
          {p + 1}
        </BsPagination.Item>
      ))}

      <BsPagination.Next
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      />
      <BsPagination.Last
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage === totalPages - 1}
      />
    </BsPagination>
  );
}