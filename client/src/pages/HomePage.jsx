import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActors, getRandomActor, getSeries } from '../services/api'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../utils/image'
import './HomePage.css'

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.5 4.5L8 12l7.5 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 4.5L16 12l-7.5 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SectionRow({ title, actors, onPrev, onNext, expandTo, canPrev, canNext }) {
  return (
    <section className="home-section">
      <div className="home-section-head">
        <h3>{title}</h3>
        <Link to={expandTo} className="expand-link">
          View all
        </Link>
      </div>
      <div className="home-row-shell">
        <button className="arrow-btn" onClick={onPrev} aria-label={`Previous ${title}`} disabled={!canPrev}>
          <ChevronLeft />
        </button>
        <div className="row-cards">
          {actors.map((actor) => (
            <a
              key={actor._id}
              href={actor.profileLink}
              className="wire-card"
              target={actor.profileLink?.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
            >
              <div className="wire-image-wrap">
                <img
                  src={getOptimizedImageUrl(actor.imageUrl, 640)}
                  srcSet={getOptimizedImageSrcSet(actor.imageUrl, 320)}
                  sizes="(max-width: 768px) 48vw, (max-width: 1100px) 30vw, 16vw"
                  alt={actor.name}
                  loading="lazy"
                />
                <div className="wire-overlay">
                  <span className="wire-name">{actor.name}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <button className="arrow-btn" onClick={onNext} aria-label={`Next ${title}`} disabled={!canNext}>
          <ChevronRight />
        </button>
      </div>
    </section>
  )
}

function HomePage() {
  const createSeed = () => Date.now() + Math.floor(Math.random() * 1000000)

  const [asianActors, setAsianActors] = useState([])
  const [europeanActors, setEuropeanActors] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [asianSeed, setAsianSeed] = useState(() => createSeed())
  const [euroSeed, setEuroSeed] = useState(() => createSeed())
  const [seriesSeed, setSeriesSeed] = useState(() => createSeed())
  const [featuredIndex, setFeaturedIndex] = useState(0)

  const [selectedTag, setSelectedTag] = useState('')
  const [randomActor, setRandomActor] = useState(null)
  const [loadingRandom, setLoadingRandom] = useState(false)
  const [excludeIds, setExcludeIds] = useState([])
  const [remaining, setRemaining] = useState(null)
  const [noMore, setNoMore] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [asianRes, euroRes, seriesRes] = await Promise.all([
          getActors(1, 30, 'asian'),
          getActors(1, 30, 'european'),
          getSeries(1, 30),
        ])
        setAsianActors(asianRes.data || [])
        setEuropeanActors(euroRes.data || [])
        setSeriesList(seriesRes.data || [])
      } catch (error) {
        console.error('Error loading homepage data:', error)
      }
    }
    loadHomeData()
  }, [])

  const pickRandomSix = (actors, seed) => {
    if (!actors.length) return []
    if (actors.length <= 6) return actors

    let random = Math.max(seed, 1)
    const next = () => {
      random = (random * 1664525 + 1013904223) % 4294967296
      return random / 4294967296
    }

    const indices = new Set()
    while (indices.size < 6) {
      indices.add(Math.floor(next() * actors.length))
    }
    return Array.from(indices).map((i) => actors[i])
  }

  const asianVisible = useMemo(() => pickRandomSix(asianActors, asianSeed), [asianActors, asianSeed])
  const euroVisible = useMemo(
    () => pickRandomSix(europeanActors, euroSeed),
    [europeanActors, euroSeed]
  )
  const seriesVisible = useMemo(() => pickRandomSix(seriesList, seriesSeed), [seriesList, seriesSeed])
  const featuredPool = useMemo(() => [...asianActors, ...europeanActors], [asianActors, europeanActors])
  const featuredActor = featuredPool.length ? featuredPool[featuredIndex % featuredPool.length] : null

  const rerandomize = (setter) => setter(createSeed())

  useEffect(() => {
    if (featuredPool.length < 2) return

    setFeaturedIndex(Math.floor(Math.random() * featuredPool.length))

    const intervalId = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPool.length)
    }, 6000)

    return () => clearInterval(intervalId)
  }, [featuredPool])

  const handleTagChange = (tag) => {
    setSelectedTag(tag)
    setRandomActor(null)
    setExcludeIds([])
    setRemaining(null)
    setNoMore(false)
  }

  const handleResetRandom = () => {
    setRandomActor(null)
    setExcludeIds([])
    setRemaining(null)
    setNoMore(false)
    setHasStarted(false)
  }

  const handleRandom = async () => {
    setLoadingRandom(true)
    setNoMore(false)
    setHasStarted(true)
    try {
      if (selectedTag === 'series') {
        const availableSeries = seriesList.filter((item) => !excludeIds.includes(item._id))
        if (availableSeries.length === 0) {
          setNoMore(true)
          setRemaining(0)
          setRandomActor(null)
          return
        }

        const pickedSeries = availableSeries[Math.floor(Math.random() * availableSeries.length)]
        const nextExcludeIds = [...excludeIds, pickedSeries._id]
        setRandomActor(pickedSeries)
        setExcludeIds(nextExcludeIds)
        setRemaining(seriesList.length - nextExcludeIds.length)
        return
      }

      const data = await getRandomActor(selectedTag, excludeIds)
      if (!data.data) {
        setNoMore(true)
        setRemaining(0)
        setRandomActor(null)
        return
      }

      setRandomActor(data.data)
      setRemaining(data.remaining)
      setExcludeIds((prev) => [...prev, data.data._id])
    } catch (error) {
      console.error('Error random actor:', error)
    } finally {
      setLoadingRandom(false)
    }
  }

  return (
    <div className="wire-home">
      {featuredActor && (
        <section className="hero-wire">
          <img
            className="hero-bg"
            src={getOptimizedImageUrl(featuredActor.imageUrl, 1400)}
            srcSet={getOptimizedImageSrcSet(featuredActor.imageUrl, 700)}
            sizes="100vw"
            alt={featuredActor.name}
          />
          <div className="hero-overlay">
            <div className="hero-switch">
              <button onClick={() => setFeaturedIndex((prev) => (prev - 1 + featuredPool.length) % featuredPool.length)} aria-label="Previous featured">
                ‹
              </button>
              <button onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredPool.length)} aria-label="Next featured">
                ›
              </button>
            </div>
            <div className="hero-content">
              <div className="hero-portrait">
                <img
                  src={getOptimizedImageUrl(featuredActor.imageUrl, 420)}
                  srcSet={getOptimizedImageSrcSet(featuredActor.imageUrl, 210)}
                  sizes="(max-width: 768px) 92px, 145px"
                  alt={featuredActor.name}
                />
              </div>
              <div className="hero-copy">
                <span className="hero-badge">Featured Talent</span>
                <h2>{featuredActor.name}</h2>
                <a
                  href={featuredActor.profileLink}
                  target={featuredActor.profileLink?.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="hero-cta"
                >
                  View Gallery
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <SectionRow
        title="Asian"
        actors={asianVisible}
        onPrev={() => rerandomize(setAsianSeed)}
        onNext={() => rerandomize(setAsianSeed)}
        expandTo="/asian"
        canPrev={asianActors.length > 6}
        canNext={asianActors.length > 6}
      />

      <SectionRow
        title="European"
        actors={euroVisible}
        onPrev={() => rerandomize(setEuroSeed)}
        onNext={() => rerandomize(setEuroSeed)}
        expandTo="/europian"
        canPrev={europeanActors.length > 6}
        canNext={europeanActors.length > 6}
      />

      <SectionRow
        title="Series"
        actors={seriesVisible}
        onPrev={() => rerandomize(setSeriesSeed)}
        onNext={() => rerandomize(setSeriesSeed)}
        expandTo="/series"
        canPrev={seriesList.length > 6}
        canNext={seriesList.length > 6}
      />

      <section className="random-wire">
        <h3>Random</h3>
        <div className="random-tags">
          <button onClick={() => handleTagChange('')} className={selectedTag === '' ? 'active' : ''}>All</button>
          <button onClick={() => handleTagChange('asian')} className={selectedTag === 'asian' ? 'active' : ''}>Asian</button>
          <button onClick={() => handleTagChange('european')} className={selectedTag === 'european' ? 'active' : ''}>European</button>
          <button onClick={() => handleTagChange('series')} className={selectedTag === 'series' ? 'active' : ''}>Series</button>
        </div>
        {hasStarted && remaining !== null && (
          <p className="remaining-text">
            {remaining} remaining
          </p>
        )}

        {(hasStarted || loadingRandom || randomActor) && (
          <div className="random-box">
            {loadingRandom ? (
              <div className="random-card-image-wrap">
                <div className="card-placeholder">
                  <p>Drawing...</p>
                </div>
              </div>
            ) : randomActor ? (
              <a
                href={randomActor.profileLink}
                target={randomActor.profileLink?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="random-card-link"
              >
                <div className="random-card-image-wrap">
                  <img
                    src={getOptimizedImageUrl(randomActor.imageUrl, 520)}
                    srcSet={getOptimizedImageSrcSet(randomActor.imageUrl, 260)}
                    sizes="220px"
                    alt={randomActor.name}
                  />
                  <div className="random-overlay">
                    <div className={`random-card-tag tag-${randomActor.tags}`}>
                      {selectedTag === 'series' ? 'SERIES' : (randomActor.tags === 'asian' ? 'ASIAN' : 'EUROPIAN')}
                    </div>
                    <div className="random-name">{randomActor.name}</div>
                  </div>
                </div>
              </a>
            ) : (
              <div className="random-box-empty" />
            )}
          </div>
        )}
        {noMore && <p className="no-more-text">No more items, reset to start over.</p>}
        <div className="random-actions">
          <button className="random-btn" onClick={handleRandom} disabled={loadingRandom || noMore}>
            {loadingRandom ? 'Drawing...' : noMore ? 'Completed' : 'Random pick'}
          </button>
          {excludeIds.length > 0 && (
            <button className="random-reset-btn" onClick={handleResetRandom}>
              Reset
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
