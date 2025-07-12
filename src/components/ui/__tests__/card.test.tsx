import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with default classes', () => {
      render(<Card data-testid="card">Card content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass(
        'bg-card',
        'text-card-foreground',
        'flex',
        'flex-col',
        'gap-6',
        'rounded-xl',
        'border',
        'py-6',
        'shadow-sm'
      )
    })

    it('should accept custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('should have data-slot attribute', () => {
      render(<Card data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('should accept custom props', () => {
      render(
        <Card data-testid="card" id="custom-id" role="region">
          Content
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('id', 'custom-id')
      expect(card).toHaveAttribute('role', 'region')
    })

    it('should render children correctly', () => {
      render(
        <Card data-testid="card">
          <div>Child content</div>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toContainHTML('<div>Child content</div>')
    })
  })

  describe('CardHeader', () => {
    it('should render header with default classes', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>)
      
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass(
        '@container/card-header',
        'grid',
        'auto-rows-min',
        'grid-rows-[auto_auto]',
        'items-start',
        'gap-1.5',
        'px-6'
      )
    })

    it('should have data-slot attribute', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      
      const header = screen.getByTestId('header')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })

    it('should accept custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>)
      
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
    })

    it('should handle grid layout classes', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('has-data-[slot=card-action]:grid-cols-[1fr_auto]')
    })
  })

  describe('CardTitle', () => {
    it('should render title with default classes', () => {
      render(<CardTitle data-testid="title">Card Title</CardTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('leading-none', 'font-semibold')
    })

    it('should have data-slot attribute', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })

    it('should accept custom className', () => {
      render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
    })

    it('should render text content', () => {
      render(<CardTitle data-testid="title">My Card Title</CardTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveTextContent('My Card Title')
    })
  })

  describe('CardDescription', () => {
    it('should render description with default classes', () => {
      render(<CardDescription data-testid="description">Description text</CardDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    })

    it('should have data-slot attribute', () => {
      render(<CardDescription data-testid="description">Description</CardDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toHaveAttribute('data-slot', 'card-description')
    })

    it('should accept custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="description">Description</CardDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toHaveClass('custom-desc')
    })

    it('should render text content', () => {
      render(<CardDescription data-testid="description">This is a description</CardDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toHaveTextContent('This is a description')
    })
  })

  describe('CardAction', () => {
    it('should render action with default classes', () => {
      render(<CardAction data-testid="action">Action content</CardAction>)
      
      const action = screen.getByTestId('action')
      expect(action).toBeInTheDocument()
      expect(action).toHaveClass(
        'col-start-2',
        'row-span-2',
        'row-start-1',
        'self-start',
        'justify-self-end'
      )
    })

    it('should have data-slot attribute', () => {
      render(<CardAction data-testid="action">Action</CardAction>)
      
      const action = screen.getByTestId('action')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })

    it('should accept custom className', () => {
      render(<CardAction className="custom-action" data-testid="action">Action</CardAction>)
      
      const action = screen.getByTestId('action')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('CardContent', () => {
    it('should render content with default classes', () => {
      render(<CardContent data-testid="content">Content text</CardContent>)
      
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('px-6')
    })

    it('should have data-slot attribute', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      
      const content = screen.getByTestId('content')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })

    it('should accept custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
      
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
    })

    it('should render children correctly', () => {
      render(
        <CardContent data-testid="content">
          <p>Paragraph content</p>
          <div>Div content</div>
        </CardContent>
      )
      
      const content = screen.getByTestId('content')
      expect(content).toContainHTML('<p>Paragraph content</p>')
      expect(content).toContainHTML('<div>Div content</div>')
    })
  })

  describe('CardFooter', () => {
    it('should render footer with default classes', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>)
      
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    })

    it('should have data-slot attribute', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
    })

    it('should accept custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>)
      
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('should handle border-t class', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('[.border-t]:pt-6')
    })
  })

  describe('Card Composition', () => {
    it('should render complete card with all components', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content</p>
          </CardContent>
          <CardFooter>
            <button>Footer button</button>
          </CardFooter>
        </Card>
      )
      
      const card = screen.getByTestId('full-card')
      expect(card).toBeInTheDocument()
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('This is the main content')).toBeInTheDocument()
      expect(screen.getByText('Footer button')).toBeInTheDocument()
    })

    it('should handle card with only header and content', () => {
      render(
        <Card data-testid="partial-card">
          <CardHeader>
            <CardTitle>Simple Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Simple content</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByTestId('partial-card')
      expect(card).toBeInTheDocument()
      expect(screen.getByText('Simple Title')).toBeInTheDocument()
      expect(screen.getByText('Simple content')).toBeInTheDocument()
    })

    it('should handle card with just content', () => {
      render(
        <Card data-testid="content-only">
          <CardContent>
            <p>Content only card</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByTestId('content-only')
      expect(card).toBeInTheDocument()
      expect(screen.getByText('Content only card')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('should have proper flex layout', () => {
      render(<Card data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('flex', 'flex-col', 'gap-6')
    })

    it('should have proper border and shadows', () => {
      render(<Card data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border', 'rounded-xl', 'shadow-sm')
    })

    it('should handle responsive container queries', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('@container/card-header')
    })
  })

  describe('Accessibility', () => {
    it('should support aria attributes', () => {
      render(
        <Card
          data-testid="card"
          aria-label="User profile card"
          role="region"
        >
          Content
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('aria-label', 'User profile card')
      expect(card).toHaveAttribute('role', 'region')
    })

    it('should support heading structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle role="heading" aria-level="2">
              Accessible Title
            </CardTitle>
            <CardDescription>
              Accessible description
            </CardDescription>
          </CardHeader>
          <CardContent>
            Content
          </CardContent>
        </Card>
      )
      
      const title = screen.getByText('Accessible Title')
      expect(title).toHaveAttribute('role', 'heading')
      expect(title).toHaveAttribute('aria-level', '2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty card', () => {
      render(<Card data-testid="empty-card" />)
      
      const card = screen.getByTestId('empty-card')
      expect(card).toBeInTheDocument()
      expect(card).toBeEmptyDOMElement()
    })

    it('should handle card with only spaces', () => {
      render(<Card data-testid="space-card">   </Card>)
      
      const card = screen.getByTestId('space-card')
      expect(card).toBeInTheDocument()
    })

    it('should handle nested cards', () => {
      render(
        <Card data-testid="outer-card">
          <CardContent>
            <Card data-testid="inner-card">
              <CardContent>Nested content</CardContent>
            </Card>
          </CardContent>
        </Card>
      )
      
      const outerCard = screen.getByTestId('outer-card')
      const innerCard = screen.getByTestId('inner-card')
      
      expect(outerCard).toBeInTheDocument()
      expect(innerCard).toBeInTheDocument()
      expect(screen.getByText('Nested content')).toBeInTheDocument()
    })

    it('should handle long content', () => {
      const longContent = 'This is a very long content that should be handled properly by the card component without any issues even if it contains multiple lines and extensive text content.'
      
      render(
        <Card data-testid="long-card">
          <CardContent>
            <p>{longContent}</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByTestId('long-card')
      expect(card).toBeInTheDocument()
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })
})