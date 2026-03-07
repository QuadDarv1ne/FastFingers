import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../components/Skeleton'
import { SkeletonList } from '../components/SkeletonList'

describe('Skeleton', () => {
  it('должен рендерить skeleton с variant="text"', () => {
    render(<Skeleton variant="text" width={100} height={20} />)
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('должен рендерить skeleton с variant="circular"', () => {
    render(<Skeleton variant="circular" width={40} height={40} />)
    const skeleton = document.querySelector('.rounded-full')
    expect(skeleton).toBeInTheDocument()
  })

  it('должен применять анимацию pulse по умолчанию', () => {
    render(<Skeleton />)
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('должен применять анимацию wave', () => {
    render(<Skeleton animation="wave" />)
    const skeleton = document.querySelector('.animate-shimmer')
    expect(skeleton).toBeInTheDocument()
  })
})

describe('SkeletonList', () => {
  it('должен рендерить список карточек по умолчанию', () => {
    render(<SkeletonList count={3} />)
    const skeletons = document.querySelectorAll('.card')
    expect(skeletons).toHaveLength(3)
  })

  it('должен рендерить список строк', () => {
    render(<SkeletonList count={5} variant="row" />)
    const rows = document.querySelectorAll('.flex.items-center')
    expect(rows).toHaveLength(5)
  })

  it('должен рендерить статистику', () => {
    render(<SkeletonList count={4} variant="stat" />)
    const stats = document.querySelectorAll('.grid')
    expect(stats).toHaveLength(1)
  })

  it('должен использовать count по умолчанию', () => {
    render(<SkeletonList />)
    const skeletons = document.querySelectorAll('.card')
    expect(skeletons).toHaveLength(3)
  })
})
