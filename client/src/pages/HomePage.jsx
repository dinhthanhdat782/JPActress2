import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActors, getRandomActor } from '../services/api'
import './HomePage.css'

function SectionRow({ title, actors, onPrev, onNext, expandTo }) {
  return (
    <section className="home-section">
      <div className="home-section-head">
        <h3>{title}</h3>
        <Link to={expandTo}>expand</Link>
      </div>
      <div className="home-row-shell">
        <button className="arrow-btn" onClick={onPrev} aria-label={`Previous ${title}`}>
          &lt;
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
        <button className="arrow-btn" onClick={onNext} aria-label={`Next ${title}`}>
          &gt;
        </button>
      </div>
    </section>
  )
}

function HomePage() {
  const [asianActors, setAsianActors] = useState([])
  const [europeanActors, setEuropeanActors] = useState([])
  const [asianIndex, setAsianIndex] = useState(0)
  const [euroIndex, setEuroIndex] = useState(0)

  const [selectedTag, setSelectedTag] = useState('')
  const [randomActor, setRandomActor] = useState(null)
  const [loadingRandom, setLoadingRandom] = useState(false)

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

  const asianVisible = useMemo(
    () => asianActors.slice(asianIndex, asianIndex + 6),
    [asianActors, asianIndex]
  )
  const euroVisible = useMemo(
    () => europeanActors.slice(euroIndex, euroIndex + 6),
    [europeanActors, euroIndex]
  )

  const moveLeft = (setter) => setter((prev) => Math.max(0, prev - 1))
  const moveRight = (actors, setter) =>
    setter((prev) => Math.min(Math.max(actors.length - 6, 0), prev + 1))

  const handleRandom = async () => {
    setLoadingRandom(true)
    try {
      const data = await getRandomActor(selectedTag, [])
      setRandomActor(data.data || null)
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
        onPrev={() => moveLeft(setAsianIndex)}
        onNext={() => moveRight(asianActors, setAsianIndex)}
        expandTo="/asian"
      />

      <SectionRow
        title="Europian"
        actors={euroVisible}
        onPrev={() => moveLeft(setEuroIndex)}
        onNext={() => moveRight(europeanActors, setEuroIndex)}
        expandTo="/europian"
      />

      <section className="random-wire">
        <h3>Random</h3>
        <div className="random-tags">
          <button onClick={() => setSelectedTag('')} className={selectedTag === '' ? 'active' : ''}>All</button>
          <button onClick={() => setSelectedTag('asian')} className={selectedTag === 'asian' ? 'active' : ''}>Asian</button>
          <button onClick={() => setSelectedTag('european')} className={selectedTag === 'european' ? 'active' : ''}>Europian</button>
        </div>
        <div className="random-box">
          {randomActor ? <img src={randomActor.imageUrl} alt={randomActor.name} /> : null}
        </div>
        <button className="random-btn" onClick={handleRandom} disabled={loadingRandom}>
          {loadingRandom ? 'Loading...' : 'Random button'}
        </button>
      </section>
    </div>
  )
}

export default HomePage
