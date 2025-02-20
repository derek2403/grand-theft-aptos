'use client'

import { useState } from 'react';
import { 
  WiDaySunny, 
  WiCloudy, 
  WiRainMix, 
  WiThunderstorm,
  WiSunrise,
  WiDaySunnyOvercast,
  WiSunset,
  WiMoonAltNew
} from 'react-icons/wi';
import { IoChevronBack } from 'react-icons/io5';
import { News } from './News';

export function WeatherControls({ onWeatherChange, timeSimRef, currentWeather, currentTime }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNews, setShowNews] = useState(false);
  
  const timeStages = [
    { hours: 6, icon: WiSunrise, label: 'Sunrise' },
    { hours: 12, icon: WiDaySunnyOvercast, label: 'Noon' },
    { hours: 17, icon: WiSunset, label: 'Sunset' },
    { hours: 20, icon: WiMoonAltNew, label: 'Night' }
  ];

  const weatherControls = [
    { type: 'sunny', icon: WiDaySunny, label: 'Sunny' },
    { type: 'cloudy', icon: WiCloudy, label: 'Cloudy' },
    { type: 'rain', icon: WiRainMix, label: 'Rain' },
    { type: 'thunderstorm', icon: WiThunderstorm, label: 'Storm' }
  ];

  const handleTimeChange = (hours) => {
    if (timeSimRef.current) {
      const newDate = timeSimRef.current.currentTime
      newDate.setHours(hours)
      newDate.setMinutes(0)
      timeSimRef.current.currentTime = newDate
    }
  };

  const formatTime = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };

  const getCurrentStageIndex = () => {
    if (!currentTime) return 0;
    const currentHour = new Date(currentTime).getHours();
    return timeStages.findIndex((stage, index, arr) => {
      const nextStage = arr[index + 1];
      if (!nextStage) return true;
      return currentHour >= stage.hours && currentHour < nextStage.hours;
    });
  };

  const handleEndDay = async () => {
    // Set time to night
    if (timeSimRef.current) {
      const newDate = timeSimRef.current.currentTime;
      newDate.setHours(20);
      newDate.setMinutes(0);
      timeSimRef.current.currentTime = newDate;
    }
    
    // Show news with autoGenerate flag
    setShowNews(true);
  };

  return (
    <>
      <div className={`fixed top-1/2 -translate-y-1/2 right-0 flex items-center transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-24px)]'}`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-6 h-12 bg-white rounded-l-md flex items-center justify-center shadow-lg"
        >
          <IoChevronBack className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Controls Panel */}
        <div className="bg-white p-6 rounded-l-lg shadow-lg">
          {/* Time Control */}
          <div className="mb-6 w-48">
            <div className="flex justify-between mb-2">
              {timeStages.map(({ hours, icon: Icon, label }) => (
                <button
                  key={hours}
                  onClick={() => handleTimeChange(hours)}
                  className={`w-8 h-8 flex items-center justify-center transition-colors
                            ${currentTime && new Date(currentTime).getHours() === hours 
                              ? 'text-blue-500' 
                              : 'text-black hover:text-blue-400'}`}
                  title={`${label} (${hours}:00)`}
                >
                  <Icon className="w-6 h-6" />
                </button>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 rounded-full relative">
              <div 
                className="absolute h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(getCurrentStageIndex() / (timeStages.length - 1)) * 100}%`
                }}
              />
            </div>
            
            <div className="text-center mt-2 text-black">
              {currentTime ? formatTime(currentTime) : "..."}
            </div>
          </div>

          {/* Weather Controls */}
          <div className="flex gap-2 justify-center mb-4">
            {weatherControls.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => onWeatherChange(type)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                         ${currentWeather === type 
                           ? 'text-blue-500' 
                           : 'text-black hover:text-blue-400'}`}
                title={label}
              >
                <Icon className="w-6 h-6" />
              </button>
            ))}
          </div>

          {/* End Day Button */}
          <div className="flex justify-center">
            <button
              onClick={handleEndDay}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              End Day
            </button>
          </div>
        </div>
      </div>

      {/* News Component with autoGenerate prop */}
      {showNews && (
        <News 
          onClose={() => setShowNews(false)} 
          autoGenerate={true}
        />
      )}
    </>
  );
} 