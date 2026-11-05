// @vitest-environment jsdom

import React from 'react';

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import App from './App';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Everyday Bottle',
    description: 'A reusable everyday bottle',
    price_cents: 2500,
    stock: 10,
    image_url: 'https://example.com/bottle.jpg',
  },
];

describe('Northstar Shop App', () => {
  beforeEach(() => {
    localStorage.clear();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url) => {
        if (url.includes('/products')) {
          return {
            ok: true,
            json: async () => mockProducts,
          };
        }

        return {
          ok: true,
          json: async () => ({
            token: 'test-token',
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
            },
          }),
        };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // Test 1: Homepage renders
  it('renders the application homepage', async () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /Good things/i,
      })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole('heading', {
        name: 'Everyday Bottle',
      })
    ).toBeInTheDocument();
  });

  // Test 2: Products load from API
  it('loads products from the API', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', {
        name: 'Everyday Bottle',
      })
    ).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  // Test 3: Shopping cart opens
  it('opens the shopping cart', async () => {
    render(<App />);

    await screen.findByRole('heading', {
      name: 'Everyday Bottle',
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Open shopping cart/i,
      })
    );

    expect(
      screen.getByRole('heading', {
        name: /Your bag/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Your bag is taking a little break/i)
    ).toBeInTheDocument();
  });

  // Test 4: Product can be added to cart
  it('adds a product to the shopping cart', async () => {
    render(<App />);

    await screen.findByRole('heading', {
      name: 'Everyday Bottle',
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Add Everyday Bottle to bag/i,
      })
    );

    expect(
      screen.getByRole('status')
    ).toHaveTextContent('Everyday Bottle added to cart');

    expect(
      screen.getByRole('button', {
        name: /Open shopping cart/i,
      })
    ).toHaveTextContent('1');

    // Verify cart contents
    fireEvent.click(
      screen.getByRole('button', {
        name: /Open shopping cart/i,
      })
    );

    expect(
      screen.getByText('Everyday Bottle')
    ).toBeInTheDocument();
  });

  // Test 5: Sign-in modal opens
  it('opens the sign-in modal', () => {
    render(<App />);

    const signInButtons = screen.getAllByRole('button', {
      name: /sign in/i,
    });

    fireEvent.click(signInButtons[0]);

    expect(
      screen.getByRole('heading', {
        name: 'Good to see you.',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/Email address/i)
    ).toBeInTheDocument();

    expect(
      document.querySelector('input[type="password"]')
    ).toBeInTheDocument();
  });
});