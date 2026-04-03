import './FilterTabs.css'

function FilterTabs({ activeFilter, onFilterChange }) {
  const filters = [
    { label: 'ALL TALENT', value: '' },
    { label: 'ASIAN', value: 'asian' },
    { label: 'EUROPEAN', value: 'european' },
  ]

  return (
    <div className="filter-tabs">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-tab ${activeFilter === filter.value ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs