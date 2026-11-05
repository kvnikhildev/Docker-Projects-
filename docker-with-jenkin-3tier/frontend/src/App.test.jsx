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
  within,
} from '@testing-library/react';

import '@testing-library/jest-dom/vitest';
import App from './App';

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
        if (String(url).includes('/products')) {
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

  const waitForProduct = async () => {
    await waitFor(() => {
      expect(
        document.querySelector('img[alt="Everyday Bottle"]')
      ).toBeInTheDocument();
    });
  };

  it('renders the application homepage', async () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Good things/i })
    ).toBeInTheDocument();

    await waitForProduct();
  });

  it('loads products from the API', async () => {
    render(<App />);

    await waitForProduct();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('opens the shopping cart', async () => {
    render(<App />);

    await waitForProduct();

    const cartButtons = screen.getAllByRole('button', {
      name: /Open shopping cart/i,
    });

    fireEvent.click(cartButtons[0]);

    expect(
      screen.getByRole('heading', { name: /Your bag/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Your bag is taking a little break/i)
    ).toBeInTheDocument();
  });

  it('adds a product to the shopping cart', async () => {
    render(<App />);

    await waitForProduct();

    // Find all matching add-to-cart buttons.
    const addButtons = screen.getAllByRole('button', {
      name: /Add Everyday Bottle to bag/i,
    });

    // Click the first matching button.
    fireEvent.click(addButtons[0]);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Everyday Bottle added to cart'
    );

    const cartButtons = screen.getAllByRole('button', {
      name: /Open shopping cart/i,
    });

    expect(cartButtons[0]).toHaveTextContent('1');

    fireEvent.click(cartButtons[0]);

    const cart = document.querySelector('.drawer');

    expect(cart).toBeInTheDocument();

    expect(
      within(cart).getByText('Everyday Bottle')
    ).toBeInTheDocument();
  });

  it('opens the sign-in modal', async () => {
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
      screen.getByRole('textbox', {
        name: /Email address/i,
      })
    ).toBeInTheDocument();

    expect(
      document.querySelector('input[type="password"]')
    ).toBeInTheDocument();
  });
});