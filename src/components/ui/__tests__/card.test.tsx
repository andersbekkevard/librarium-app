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
    it('should render card with children', () => {
      render(<Card data-testid="card">Card content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('Card content')
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

  describe('CardTitle', () => {
    it('should render text content', () => {
      render(<CardTitle data-testid="title">My Card Title</CardTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveTextContent('My Card Title')
    })
  })

  describe('CardDescription', () => {
    it('should render text content', () => {
      render(<CardDescription data-testid="description">This is a description</CardDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toHaveTextContent('This is a description')
    })
  })

  describe('CardContent', () => {
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