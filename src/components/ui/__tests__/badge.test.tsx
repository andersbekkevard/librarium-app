import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '../badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render badge with children', () => {
      render(<Badge>Test Badge</Badge>)
      
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('should render as child element when asChild is true', () => {
      render(
        <Badge asChild>
          <a href="/test" data-testid="badge-link">Link badge</a>
        </Badge>
      )
      
      const link = screen.getByTestId('badge-link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveTextContent('Link badge')
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should have data-slot attribute', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-slot', 'badge')
    })

    it('should render as span by default', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge.tagName).toBe('SPAN')
    })
  })

  describe('Variants', () => {
    it('should render default variant correctly', () => {
      render(<Badge data-testid="badge">Default</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-primary',
        'text-primary-foreground'
      )
    })

    it('should render secondary variant correctly', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-secondary',
        'text-secondary-foreground'
      )
    })

    it('should render destructive variant correctly', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-destructive',
        'text-white'
      )
    })

    it('should render outline variant correctly', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-foreground')
    })
  })

  describe('Base Classes', () => {
    it('should have base styling classes', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'border',
        'px-2',
        'py-0.5',
        'text-xs',
        'font-medium',
        'w-fit',
        'whitespace-nowrap',
        'shrink-0'
      )
    })

    it('should have focus and accessibility classes', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20',
        'aria-invalid:border-destructive'
      )
    })

    it('should have icon and transition classes', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        '[&>svg]:size-3',
        'gap-1',
        '[&>svg]:pointer-events-none',
        'transition-[color,box-shadow]',
        'overflow-hidden'
      )
    })
  })

  describe('Hover Effects', () => {
    it('should have hover classes for default variant as link', () => {
      render(
        <Badge asChild data-testid="badge">
          <a href="/test">Link badge</a>
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('[a&]:hover:bg-primary/90')
    })

    it('should have hover classes for secondary variant as link', () => {
      render(
        <Badge variant="secondary" asChild data-testid="badge">
          <a href="/test">Link badge</a>
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('[a&]:hover:bg-secondary/90')
    })

    it('should have hover classes for destructive variant as link', () => {
      render(
        <Badge variant="destructive" asChild data-testid="badge">
          <a href="/test">Link badge</a>
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('[a&]:hover:bg-destructive/90')
    })

    it('should have hover classes for outline variant as link', () => {
      render(
        <Badge variant="outline" asChild data-testid="badge">
          <a href="/test">Link badge</a>
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('[a&]:hover:bg-accent', '[a&]:hover:text-accent-foreground')
    })
  })

  describe('Icon Handling', () => {
    it('should render badge with icon correctly', () => {
      render(
        <Badge data-testid="badge">
          <svg data-testid="icon" width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="3" />
          </svg>
          With Icon
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      const icon = screen.getByTestId('icon')
      
      expect(badge).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
      expect(badge).toHaveClass('gap-1')
    })

    it('should apply icon-specific classes', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('[&>svg]:size-3', '[&>svg]:pointer-events-none')
    })

    it('should handle multiple icons', () => {
      render(
        <Badge data-testid="badge">
          <svg data-testid="icon1" width="12" height="12">
            <circle cx="6" cy="6" r="3" />
          </svg>
          <svg data-testid="icon2" width="12" height="12">
            <circle cx="6" cy="6" r="3" />
          </svg>
          Multiple Icons
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      const icon1 = screen.getByTestId('icon1')
      const icon2 = screen.getByTestId('icon2')
      
      expect(badge).toBeInTheDocument()
      expect(icon1).toBeInTheDocument()
      expect(icon2).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should handle aria-invalid state correctly', () => {
      render(<Badge aria-invalid="true" data-testid="badge">Invalid</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-invalid', 'true')
      expect(badge).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive')
    })

    it('should support aria-label', () => {
      render(<Badge aria-label="Status indicator" data-testid="badge">Status</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-label', 'Status indicator')
    })

    it('should support role attribute', () => {
      render(<Badge role="status" data-testid="badge">Status</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('role', 'status')
    })

    it('should be focusable when interactive', () => {
      render(<Badge data-testid="badge" tabIndex={0}>Interactive badge</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('tabindex', '0')
    })

    it('should have proper focus styles', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]')
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Badge className="custom-class" data-testid="badge">Custom</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('custom-class')
    })

    it('should accept custom data attributes', () => {
      render(<Badge data-custom="value" data-testid="badge">Custom</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-custom', 'value')
    })

    it('should accept custom id', () => {
      render(<Badge id="custom-id" data-testid="badge">Custom ID</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('id', 'custom-id')
    })

    it('should accept custom styles', () => {
      render(<Badge style={{ color: 'red' }} data-testid="badge">Custom Style</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })
  })

  describe('Content Handling', () => {
    it('should handle text content', () => {
      render(<Badge data-testid="badge">Simple text</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('Simple text')
    })

    it('should handle empty content', () => {
      render(<Badge data-testid="badge"></Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeEmptyDOMElement()
    })

    it('should handle number content', () => {
      render(<Badge data-testid="badge">{42}</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('42')
    })

    it('should handle zero content', () => {
      render(<Badge data-testid="badge">{0}</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('0')
    })

    it('should handle boolean content', () => {
      render(<Badge data-testid="badge">{true}</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeEmptyDOMElement()
    })

    it('should handle long text content', () => {
      const longText = 'This is a very long badge text that should be handled properly'
      render(<Badge data-testid="badge">{longText}</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent(longText)
      expect(badge).toHaveClass('whitespace-nowrap', 'overflow-hidden')
    })
  })

  describe('Destructive Variant Focus', () => {
    it('should have destructive focus ring classes', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('focus-visible:ring-destructive/20')
    })

    it('should have dark mode destructive classes', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('dark:focus-visible:ring-destructive/40', 'dark:bg-destructive/60')
    })
  })

  describe('Interaction', () => {
    it('should handle click events when interactive', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Badge asChild data-testid="badge">
          <button onClick={handleClick}>Clickable badge</button>
        </Badge>
      )
      
      await user.click(screen.getByTestId('badge'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle keyboard events when interactive', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Badge asChild data-testid="badge">
          <button onClick={handleClick}>Keyboard badge</button>
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      badge.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle combination of all props', () => {
      render(
        <Badge
          variant="destructive"
          className="custom-class"
          aria-label="Complex badge"
          data-testid="complex-badge"
          id="complex-id"
        >
          Complex Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('complex-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('custom-class')
      expect(badge).toHaveAttribute('aria-label', 'Complex badge')
      expect(badge).toHaveAttribute('id', 'complex-id')
      expect(badge).toHaveTextContent('Complex Badge')
    })

    it('should handle nested elements', () => {
      render(
        <Badge data-testid="badge">
          <span>Nested</span>
          <strong>Content</strong>
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toContainHTML('<span>Nested</span>')
      expect(badge).toContainHTML('<strong>Content</strong>')
    })

    it('should handle special characters', () => {
      render(<Badge data-testid="badge">Special: @#$%^&*()</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('Special: @#$%^&*()')
    })
  })
})