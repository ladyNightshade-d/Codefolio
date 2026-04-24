import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SearchAssistant from './SearchAssistant'

describe('SearchAssistant', () => {
  it('renders search helper when no query', () => {
    render(<SearchAssistant query="" onExampleClick={() => {}} toAppHref={() => '#'} />)
    expect(screen.getByText('Need help finding the right project?')).toBeInTheDocument()
  })

  it('renders search results when query provided', () => {
    const mockProjects = [
      { slug: 'test', title: 'Test Project', stack: 'React', image: '/test.png', imageAlt: 'Test' }
    ]
    render(
      <SearchAssistant
        query="test"
        projects={mockProjects}
        onExampleClick={() => {}}
        toAppHref={() => '#'}
      />
    )
    expect(screen.getByText(/Search results for/)).toBeInTheDocument()
  })
})