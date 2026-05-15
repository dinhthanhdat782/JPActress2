import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActors, getRandomActor } from '../services/api'
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
              <img src={actor.imageUrl} alt={actor.name} />
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
  const [asianActors, setAsianActors] = useState([])
  const [europeanActors, setEuropeanActors] = useState([])
  const [asianSeed, setAsianSeed] = useState(0)
  const [euroSeed, setEuroSeed] = useState(0)

  const [selectedTag, setSelectedTag] = useState('')
  const [randomActor, setRandomActor] = useState(null)
  const [loadingRandom, setLoadingRandom] = useState(false)
  const [excludeIds, setExcludeIds] = useState([])
  const [remaining, setRemaining] = useState(null)
  const [noMore, setNoMore] = useState(false)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [asianRes, euroRes] = await Promise.all([
          getActors(1, 30, 'asian'),
          getActors(1, 30, 'european'),
        ])
        setAsianActors(asianRes.data || [])
        setEuropeanActors(euroRes.data || [])
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

  const rerandomize = (setter) => setter(Date.now() + Math.floor(Math.random() * 100000))

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
  }

  const handleRandom = async () => {
    setLoadingRandom(true)
    setNoMore(false)
    try {
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
        title="Europian"
        actors={euroVisible}
        onPrev={() => rerandomize(setEuroSeed)}
        onNext={() => rerandomize(setEuroSeed)}
        expandTo="/europian"
        canPrev={europeanActors.length > 6}
        canNext={europeanActors.length > 6}
      />

      <section className="random-wire">
        <h3>Random</h3>
        <div className="random-tags">
          <button onClick={() => handleTagChange('')} className={selectedTag === '' ? 'active' : ''}>All</button>
          <button onClick={() => handleTagChange('asian')} className={selectedTag === 'asian' ? 'active' : ''}>Asian</button>
          <button onClick={() => handleTagChange('european')} className={selectedTag === 'european' ? 'active' : ''}>Europian</button>
        </div>
        {remaining !== null && (
          <p className="remaining-text">
            {remaining} remaining
          </p>
        )}
        <div className="random-box">
          {randomActor ? (
            <a
              href={randomActor.profileLink}
              target={randomActor.profileLink?.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className="random-card-link"
            >
              <div className="random-card-image-wrap">
                <img src={randomActor.imageUrl} alt={randomActor.name} />
              </div>
              <div className="random-card-content">
                <span className={`random-card-tag tag-${randomActor.tags}`}>
                  {randomActor.tags === 'asian' ? 'ASIAN' : 'EUROPIAN'}
                </span>
                <h4>{randomActor.name}</h4>
                <span className="random-card-cta">VIEW PROFILE →</span>
              </div>
            </a>
          ) : null}
        </div>
        {noMore && <p className="no-more-text">No more actors, reset to start over.</p>}
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
