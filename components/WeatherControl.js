export function WeatherControls({ onWeatherChange, timeSimRef, currentWeather, currentTime }) {
    const formatTime = (date) => {
      if (!(date instanceof Date)) {
        date = new Date(date)  // Ensure we have a Date object
      }
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  
    const handleSetTime = (hours) => {
      if (timeSimRef.current) {
        const newDate = timeSimRef.current.currentTime
        newDate.setHours(hours)
        newDate.setMinutes(0)
        timeSimRef.current.currentTime = newDate
      }
    }
  
    return (
      <div className="absolute top-4 right-4 bg-black/50 p-4 rounded-lg text-white">
        <div className="mb-4">
          <h3 className="mb-2 font-bold">Time Control</h3>
          <div className="text-xl mb-2">
            {currentTime ? formatTime(currentTime) : "Loading..."}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSetTime(6)}
              className="px-3 py-1 rounded bg-gray-600"
            >
              Sunrise (6:00)
            </button>
            <button
              onClick={() => handleSetTime(12)}
              className="px-3 py-1 rounded bg-gray-600"
            >
              Noon (12:00)
            </button>
            <button
              onClick={() => handleSetTime(17)}
              className="px-3 py-1 rounded bg-gray-600"
            >
              Sunset (17:00)
            </button>
            <button
              onClick={() => handleSetTime(20)}
              className="px-3 py-1 rounded bg-gray-600"
            >
              Night (20:00)
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="mb-2 font-bold">Weather</h3>
          <div className="flex flex-wrap gap-2">
            {['sunny', 'cloudy', 'rain', 'thunderstorm'].map((weather) => (
              <button
                key={weather}
                onClick={() => onWeatherChange(weather)}
                className={`px-3 py-1 rounded capitalize ${
                  currentWeather === weather ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                {weather}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  } 