import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameCard from '../gamecard';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

global.fetch = jest.fn();

const mockGame = {
  id: 1,
  title: 'Test Game',
  condition: '4/5',
  players: '2-4',
  playtime: '60 min',
  image: 'https://example.com/game.jpg',
  ownerEmail: 'owner@example.com',
  ownerName: 'Game Owner',
  difficulty: 'Srednje'
};

describe('GameCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('user@example.com');
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
  });

  test('renders game information correctly', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText(/4\/5/)).toBeInTheDocument();
    expect(screen.getByText(/2-4/)).toBeInTheDocument();
    expect(screen.getByText(/60 min/)).toBeInTheDocument();
  });

  test('shows trade button for non-owner', () => {
    localStorageMock.getItem.mockReturnValue('user@example.com');
    
    render(<GameCard game={mockGame} showTradeButton={true} />);

    expect(screen.getByText('Ponudi zamjenu')).toBeInTheDocument();
  });

  test('hides trade button for owner', () => {
    localStorageMock.getItem.mockReturnValue('owner@example.com');
    
    render(<GameCard game={mockGame} showTradeButton={true} />);

    expect(screen.queryByText('Ponudi zamjenu')).not.toBeInTheDocument();
    expect(screen.getByText('Vaša igra')).toBeInTheDocument();
  });

  test('shows "Moja igra" badge for owner', () => {
    localStorageMock.getItem.mockReturnValue('owner@example.com');
    
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Moja igra')).toBeInTheDocument();
  });

  test('hides trade button when showTradeButton is false', () => {
    render(<GameCard game={mockGame} showTradeButton={false} />);

    expect(screen.queryByText('Ponudi zamjenu')).not.toBeInTheDocument();
  });

  test('opens trade modal when clicking trade button', async () => {
    localStorageMock.getItem.mockReturnValue('user@example.com');
    
    render(<GameCard game={mockGame} showTradeButton={true} />);

    fireEvent.click(screen.getByText('Ponudi zamjenu'));

    await waitFor(() => {
      expect(screen.getByText('Tražite igru:')).toBeInTheDocument();
    });
  });

  test('displays game condition badge', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText(/Očuvanost:/)).toBeInTheDocument();
  });

  test('displays difficulty badge when present', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Srednje')).toBeInTheDocument();
  });

  test('handles image load error gracefully', () => {
    render(<GameCard game={mockGame} />);

    const image = screen.getByAltText('Test Game');
    fireEvent.error(image);

    expect(image.src).toContain('placehold.co');
  });
});

describe('GameCard Trade Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('user@example.com');
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 2, title: 'My Game 1', hasImage: false },
        { id: 3, title: 'My Game 2', hasImage: false }
      ])
    });
  });

  test('loads user games when opening modal', async () => {
    render(<GameCard game={mockGame} showTradeButton={true} />);

    fireEvent.click(screen.getByText('Ponudi zamjenu'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/myGames')
      );
    });
  });

  test('can close modal', async () => {
    render(<GameCard game={mockGame} showTradeButton={true} />);

    fireEvent.click(screen.getByText('Ponudi zamjenu'));

    await waitFor(() => {
      expect(screen.getByText('Tražite igru:')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Odustani'));

    await waitFor(() => {
      expect(screen.queryByText('Tražite igru:')).not.toBeInTheDocument();
    });
  });

  test('shows message when user has no games', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<GameCard game={mockGame} showTradeButton={true} />);

    fireEvent.click(screen.getByText('Ponudi zamjenu'));

    await waitFor(() => {
      expect(screen.getByText(/Nemate igara za ponudu/)).toBeInTheDocument();
    });
  });

  test('submit button is disabled when no games selected', async () => {
    render(<GameCard game={mockGame} showTradeButton={true} />);

    fireEvent.click(screen.getByText('Ponudi zamjenu'));

    await waitFor(() => {
      const submitButton = screen.getByText('Pošalji ponudu');
      expect(submitButton).toBeDisabled();
    });
  });
});
