import { render, screen } from '@testing-library/react';
import { ListDetailView } from '../ListDetailView';
import { describe, it, expect, vi } from 'vitest';
import * as AppContext from '../../context/AppContext';

vi.mock('../../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

describe('ListDetailView', () => {
  it('renders "Select a list from the sidebar." when no list is selected', () => {
    vi.spyOn(AppContext, 'useAppContext').mockReturnValue({ selectedListId: null });
    render(<ListDetailView />);
    expect(screen.getByText('Select a list from the sidebar.')).toBeDefined();
  });
});
