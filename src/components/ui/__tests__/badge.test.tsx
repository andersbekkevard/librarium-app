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

    it('should render as span by default', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge.tagName).toBe('SPAN')
    })
  })

  describe('Accessibility', () => {
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
})