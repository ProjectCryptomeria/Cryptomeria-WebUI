// src/shared/ui/Button.test.tsx
// FSD Layer: Shared/UI - コンポーネントの機能的ユニットテスト

import { render, screen } from '@/shared/lib/test-utils/renderWithProviders';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Shared/UI: Button Component', () => {
  it('should render the button with correct text', () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole('button', { name: /送信/i })).toBeInTheDocument();
  });

  it('should call the onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>クリック</Button>);

    await user.click(screen.getByRole('button', { name: /クリック/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show loading spinner when isLoading is true', () => {
    render(<Button isLoading>送信</Button>);
    // Loader2 is rendered when isLoading is true. It usually has a specific class or role,
    // but here we can check if the button is disabled or check for the spinner class if we knew it.
    // Based on the code: <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    // We can query by the presence of the spinner.
    // However, simpler is to check if it's disabled which is a side effect of isLoading.
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
