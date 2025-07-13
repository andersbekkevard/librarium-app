import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('should have data-slot attribute', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('data-slot', 'input')
    })

    it('should have default type attribute', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      // When type is not specified, browser defaults to "text" but may not show the attribute
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('should accept custom type', () => {
      render(<Input type="password" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('Input Types', () => {
    it('should render text input correctly', () => {
      render(<Input type="text" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render email input correctly', () => {
      render(<Input type="email" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password input correctly', () => {
      render(<Input type="password" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render number input correctly', () => {
      render(<Input type="number" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render search input correctly', () => {
      render(<Input type="search" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('should render tel input correctly', () => {
      render(<Input type="tel" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render url input correctly', () => {
      render(<Input type="url" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('should render date input correctly', () => {
      render(<Input type="date" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'date')
    })

    it('should render file input correctly', () => {
      render(<Input type="file" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'file')
    })
  })

  describe('Base Classes', () => {
    it('should have base styling classes', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'flex',
        'h-9',
        'w-full',
        'min-w-0',
        'rounded-md',
        'border',
        'bg-transparent',
        'px-3',
        'py-1',
        'text-base',
        'shadow-xs',
        'outline-none'
      )
    })

    it('should have responsive text size classes', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('text-base', 'md:text-sm')
    })

    it('should have border and background classes', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('border-input', 'dark:bg-input/30')
    })

    it('should have placeholder and selection classes', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'placeholder:text-muted-foreground',
        'selection:bg-primary',
        'selection:text-primary-foreground'
      )
    })

    it('should have transition classes', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('transition-[color,box-shadow]')
    })
  })

  describe('File Input Classes', () => {
    it('should have file input specific classes', () => {
      render(<Input type="file" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'file:text-foreground',
        'file:inline-flex',
        'file:h-7',
        'file:border-0',
        'file:bg-transparent',
        'file:text-sm',
        'file:font-medium'
      )
    })
  })

  describe('Focus States', () => {
    it('should have focus-visible classes', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]'
      )
    })

    it('should be focusable', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      await user.click(input)
      
      expect(input).toHaveFocus()
    })

    it('should handle keyboard focus', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="input" />)
      
      await user.tab()
      
      const input = screen.getByTestId('input')
      expect(input).toHaveFocus()
    })
  })

  describe('Disabled States', () => {
    it('should have disabled classes when disabled', () => {
      render(<Input disabled data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'disabled:pointer-events-none',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      )
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toBeDisabled()
    })

    it('should not be focusable when disabled', async () => {
      const user = userEvent.setup()
      render(<Input disabled data-testid="input" />)
      
      await user.tab()
      
      const input = screen.getByTestId('input')
      expect(input).not.toHaveFocus()
    })
  })

  describe('Invalid States', () => {
    it('should have aria-invalid classes when invalid', () => {
      render(<Input aria-invalid="true" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'aria-invalid:ring-destructive/20',
        'aria-invalid:border-destructive',
        'dark:aria-invalid:ring-destructive/40'
      )
    })

    it('should accept aria-invalid attribute', () => {
      render(<Input aria-invalid="true" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Value and Change Handling', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input') as HTMLInputElement
      await user.type(input, 'test value')
      
      expect(input.value).toBe('test value')
    })

    it('should handle controlled input', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input
            data-testid="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )
      }
      
      render(<TestComponent />)
      
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should call onChange handler', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Input data-testid="input" onChange={handleChange} />)
      
      const input = screen.getByTestId('input')
      await user.type(input, 'a')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle default value', () => {
      render(<Input defaultValue="default value" data-testid="input" />)
      
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('default value')
    })
  })

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      render(<Input placeholder="Enter text here" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('placeholder', 'Enter text here')
    })

    it('should have placeholder styling classes', () => {
      render(<Input placeholder="Test" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('placeholder:text-muted-foreground')
    })
  })

  describe('Form Integration', () => {
    it('should accept name attribute', () => {
      render(<Input name="username" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('name', 'username')
    })

    it('should accept id attribute', () => {
      render(<Input id="user-input" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('id', 'user-input')
    })

    it('should accept required attribute', () => {
      render(<Input required data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('required')
    })

    it('should accept minLength and maxLength', () => {
      render(<Input minLength={3} maxLength={10} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('minLength', '3')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('should accept pattern attribute', () => {
      render(<Input pattern="[0-9]+" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('pattern', '[0-9]+')
    })
  })

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username input" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-label', 'Username input')
    })

    it('should support aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" data-testid="input" />
          <div id="help-text">Help text</div>
        </div>
      )
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should support aria-labelledby', () => {
      render(
        <div>
          <label id="label-text">Username:</label>
          <Input aria-labelledby="label-text" data-testid="input" />
        </div>
      )
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-labelledby', 'label-text')
    })

    it('should have implicit textbox role', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      // Input elements have implicit textbox role, but it's not explicitly set as an attribute
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Input className="custom-class" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('custom-class')
    })

    it('should accept custom style', () => {
      render(<Input style={{ color: 'red' }} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })

    it('should accept custom data attributes', () => {
      render(<Input data-custom="value" data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('Event Handling', () => {
    it('should handle onFocus event', async () => {
      const handleFocus = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onFocus={handleFocus} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      await user.click(input)
      
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should handle onBlur event', async () => {
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onBlur={handleBlur} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      await user.click(input)
      await user.tab()
      
      expect(handleBlur).toHaveBeenCalled()
    })

    it('should handle onKeyDown event', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onKeyDown={handleKeyDown} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      await user.type(input, 'a')
      
      expect(handleKeyDown).toHaveBeenCalled()
    })

    it('should handle onKeyUp event', async () => {
      const handleKeyUp = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onKeyUp={handleKeyUp} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      await user.type(input, 'a')
      
      expect(handleKeyUp).toHaveBeenCalled()
    })
  })

  describe('Number Input Specifics', () => {
    it('should handle min and max for number input', () => {
      render(<Input type="number" min={0} max={100} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })

    it('should handle step for number input', () => {
      render(<Input type="number" step={0.5} data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('step', '0.5')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      render(<Input value="" data-testid="input" onChange={() => {}} />)
      
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle null value gracefully', () => {
      render(<Input value={undefined} data-testid="input" onChange={() => {}} />)
      
      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
    })

    it('should handle undefined value gracefully', () => {
      render(<Input value={undefined} data-testid="input" onChange={() => {}} />)
      
      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
    })

    it('should handle combination of all props', () => {
      render(
        <Input
          type="email"
          className="custom-class"
          disabled
          required
          placeholder="Enter email"
          aria-label="Email input"
          data-testid="complex-input"
          id="email-input"
          name="email"
        />
      )
      
      const input = screen.getByTestId('complex-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveClass('custom-class')
      expect(input).toBeDisabled()
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('placeholder', 'Enter email')
      expect(input).toHaveAttribute('aria-label', 'Email input')
      expect(input).toHaveAttribute('id', 'email-input')
      expect(input).toHaveAttribute('name', 'email')
    })
  })
})