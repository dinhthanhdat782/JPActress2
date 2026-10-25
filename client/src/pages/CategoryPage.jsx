import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { getActors, getFavorites, getSeries, getCategories, getOnlyFans, recordHistory } from '../services/api'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../utils/image'
import FavoriteButton from '../components/FavoriteButton'
import LoadingGrid from '../components/LoadingGrid'
import './CategoryPage.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function CategoryPage({ title, tag, type = 'actors' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const loadMoreRef = useRef(null)
  const pageRef = useRef(null)
  const animatedCountRef = useRef(0)

  const trackView = (id) => {
    try {
      if (JSON.parse(localStorage.getItem('user') || 'null')?.token) {
        recordHistory(type === 'series' ? 'series' : type === 'category' ? 'category' : type === 'onlyfans' ? 'onlyfans' : 'actor', id, 'view').catch(() => {})
      }
    } catch {
      // Ignore malformed local session data.
    }
  }

  const fetchItems = useCallback(async (page, replace = false) => {
      if (replace) setLoading(true)
      else setLoadingMore(true)
      try {
        const data = type === 'series'
          ? await getSeries(page, 24, tag)
          : type === 'category'
            ? await getCategories(page, 24, tag)
            : type === 'onlyfans'
              ? await getOnlyFans(page, 24, tag)
            : await getActors(page, 24, tag)
        setItems((previous) => (replace ? (data.data || []) : [...previous, ...(data.data || [])]))
        setCurrentPage(page)
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
      } finally {
        if (replace) setLoading(false)
        else setLoadingMore(false)
      }
  }, [tag, type])

  useEffect(() => {
    animatedCountRef.current = 0
    setItems([])
    setCurrentPage(1)
    setTotalPages(1)
    fetchItems(1, true)
  }, [fetchItems, tag, type])

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading && !loadingMore && currentPage < totalPages) {
        fetchItems(currentPage + 1)
      }
    }, { rootMargin: '500px 0px' })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [currentPage, fetchItems, loading, loadingMore, totalPages])

  useEffect(() => {
    let cancelled = false
    let savedUser = null
    try {
      savedUser = JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      savedUser = null
    }

    if (!savedUser?.token) {
      setFavoriteIds(new Set())
      return undefined
    }

    getFavorites()
      .then((response) => {
        if (cancelled) return
        const favoriteItems = type === 'series' ? response.data?.series : type === 'category' ? response.data?.categories : type === 'onlyfans' ? response.data?.onlyFans : response.data?.actors
        setFavoriteIds(new Set((favoriteItems || []).map((item) => item._id)))
      })
      .catch(() => {
        if (!cancelled) setFavoriteIds(new Set())
      })

    return () => { cancelled = true }
  }, [type])

  useGSAP(() => {
    if (loading) return

    const cards = Array.from(pageRef.current.querySelectorAll('.category-card'))
    const newCards = cards.slice(animatedCountRef.current)
    animatedCountRef.current = cards.length
    if (!newCards.length) return

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(newCards, {
        autoAlpha: 0,
        y: 20,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.52,
        stagger: 0.045,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: newCards[0],
          start: 'top 90%',
          once: true,
        },
      })
    })
    return () => media.revert()
  }, { scope: pageRef, dependencies: [loading, items.length], revertOnUpdate: true })

  return (
    <div className="category-page" ref={pageRef}>
      <div className="category-head">
        <h2>{title}</h2>
        <p>Explore our curated collection of high-quality cinematic {type === 'series' ? 'series' : type === 'category' ? 'categories' : type === 'onlyfans' ? 'OnlyFans creators' : 'talent'}.</p>
      </div>
      {loading ? (
        <LoadingGrid count={12} label={`Loading ${type === 'series' ? 'series' : type === 'category' ? 'categories' : type === 'onlyfans' ? 'OnlyFans creators' : 'talent'}...`} />
      ) : (
        <>
          <div className="category-grid">
            {items.map((item) => (
              <a
                key={item._id}
                className="category-card"
                href={item.profileLink}
                target={item.profileLink?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                onClick={() => trackView(item._id)}
              >
                <div className="category-image-wrap">
                  <FavoriteButton
                    type={type === 'series' ? 'series' : type === 'category' ? 'category' : type === 'onlyfans' ? 'onlyfans' : 'actor'}
                    id={item._id}
                    initialFavorite={favoriteIds.has(item._id)}
                  />
                  <img
                    src={getOptimizedImageUrl(item.imageUrl, 700)}
                    srcSet={getOptimizedImageSrcSet(item.imageUrl, 350)}
                    sizes="(max-width: 768px) 48vw, (max-width: 1200px) 30vw, 22vw"
                    alt={item.name}
                    loading="lazy"
                  />
                  <div className="category-overlay">
                    <span className="category-name">{item.name}</span>
                  </div>
                </div>
              </a>
            ))}
            {loadingMore && Array.from({ length: 6 }, (_, index) => (
              <div className="category-skeleton-slot" key={`loading-${index}`} aria-hidden="true">
                <div className="category-skeleton-image" />
                <div className="category-skeleton-footer" />
              </div>
            ))}
          </div>
          {currentPage < totalPages && (
            <div ref={loadMoreRef} className="category-load-status" aria-live="polite">
              {loadingMore ? 'Loading more...' : 'Scroll to load more'}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CategoryPage
