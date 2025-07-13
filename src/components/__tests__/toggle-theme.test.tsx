import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleTheme } from '../toggle-theme'
import { useTheme } from 'next-themes'

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

const mockedUseTheme = useTheme as jest.Mock

describe('ToggleTheme', () => {
  it('toggles from light to dark', async () => {
    const setTheme = jest.fn()
    mockedUseTheme.mockReturnValue({ theme: 'light', setTheme })
    const user = userEvent.setup()
    render(<ToggleTheme />)

    await user.click(screen.getByRole('button'))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('toggles from dark to light', async () => {
    const setTheme = jest.fn()
    mockedUseTheme.mockReturnValue({ theme: 'dark', setTheme })
    const user = userEvent.setup()
    render(<ToggleTheme />)

    await user.click(screen.getByRole('button'))
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('has accessible label', () => {
    const setTheme = jest.fn()
    mockedUseTheme.mockReturnValue({ theme: 'light', setTheme })
    render(<ToggleTheme />)

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })
})
