import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with children', () => {
      render(<Button>Click me</Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link button</a>
        </Button>
      )
      
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveTextContent('Link button')
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should have data-slot attribute', () => {
      render(<Button>Test</Button>)
      
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('Variants', () => {
    it('should render default variant correctly', () => {
      render(<Button>Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('should render destructive variant correctly', () => {
      render(<Button variant="destructive">Destructive</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'text-white')
    })

    it('should render outline variant correctly', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'bg-background')
    })

    it('should render secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('should render ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
    })

    it('should render link variant correctly', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline')
    })
  })

  describe('Sizes', () => {
    it('should render default size correctly', () => {
      render(<Button>Default Size</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'px-4', 'py-2')
    })

    it('should render small size correctly', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'px-3')
    })

    it('should render large size correctly', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-6')
    })

    it('should render icon size correctly', () => {
      render(<Button size="icon">Icon</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('size-9')
    })
  })

  describe('States', () => {
    it('should handle disabled state correctly', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('should handle aria-invalid state correctly', () => {
      render(<Button aria-invalid="true">Invalid</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-invalid', 'true')
      expect(button).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive')
    })

    it('should handle focus state correctly', () => {
      render(<Button>Focus test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]')
    })
  })

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle keyboard events (Enter)', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Press enter</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle keyboard events (Space)', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Press space</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick} disabled>Disabled button</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<Button>Accessible button</Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Save document">Save</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Save document')
    })

    it('should support aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Submit</Button>
          <div id="help-text">This will submit the form</div>
        </div>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should be focusable by keyboard', async () => {
      const user = userEvent.setup()
      
      render(<Button>Focusable</Button>)
      
      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()
    })

    it('should not be focusable when disabled', async () => {
      const user = userEvent.setup()
      
      render(<Button disabled>Not focusable</Button>)
      
      await user.tab()
      expect(screen.getByRole('button')).not.toHaveFocus()
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should accept custom data attributes', () => {
      render(<Button data-testid="custom-button">Custom</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-testid', 'custom-button')
    })

    it('should accept custom id', () => {
      render(<Button id="custom-id">Custom ID</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'custom-id')
    })

    it('should accept custom type', () => {
      render(<Button type="submit">Submit</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('Icon Handling', () => {
    it('should handle buttons with icons', () => {
      render(
        <Button>
          <svg data-testid="icon" width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6L8 0Z" />
          </svg>
          Button with icon
        </Button>
      )
      
      const button = screen.getByRole('button')
      const icon = screen.getByTestId('icon')
      
      expect(button).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
      expect(button).toHaveClass('gap-2')
    })

    it('should apply icon-specific classes', () => {
      render(<Button>Test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('[&_svg]:pointer-events-none', '[&_svg:not([class*=\'size-\'])]:size-4')
    })
  })

  describe('Hover Effects', () => {
    it('should have hover classes for default variant', () => {
      render(<Button>Hover test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-primary/90')
    })

    it('should have hover classes for destructive variant', () => {
      render(<Button variant="destructive">Hover test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-destructive/90')
    })

    it('should have hover classes for outline variant', () => {
      render(<Button variant="outline">Hover test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
    })
  })

  describe('Transition Effects', () => {
    it('should have transition classes', () => {
      render(<Button>Transition test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('transition-all')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <Button>
          <span>First</span>
          <span>Second</span>
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('FirstSecond')
    })

    it('should handle combination of all props', () => {
      render(
        <Button
          variant="destructive"
          size="lg"
          disabled
          className="custom-class"
          aria-label="Complex button"
          data-testid="complex-button"
        >
          Complex Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveAttribute('aria-label', 'Complex button')
      expect(button).toHaveAttribute('data-testid', 'complex-button')
    })
  })
})