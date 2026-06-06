import React from 'react';
import { render, screen } from '@testing-library/react';
import ColumnHeader from '@/client/components/board/ColumnHeader';

describe('ColumnHeader', () => {
  it('칼럼명(title)을 표시한다', () => {
    render(<ColumnHeader title="Backlog" count={3} />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
  });

  it('티켓 수(count)를 .column-count 요소에 표시한다', () => {
    render(<ColumnHeader title="Backlog" count={3} />);
    const countEl = document.querySelector('.column-count');
    expect(countEl).toBeInTheDocument();
    expect(countEl).toHaveTextContent('3');
  });

  it('count=0 → 뱃지에 "0" 표시', () => {
    render(<ColumnHeader title="Done" count={0} />);
    expect(document.querySelector('.column-count')).toHaveTextContent('0');
  });

  it('.column-header 클래스를 가진다', () => {
    const { container } = render(<ColumnHeader title="Todo" count={1} />);
    expect(container.firstChild).toHaveClass('column-header');
  });
});
