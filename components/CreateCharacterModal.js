import React from 'react'
import presets from '../data/presets.json'

export function CreateCharacterModal({ 
  showModal, 
  onClose, 
  onSubmit, 
  characterForm, 
  setCharacterForm 
}) {
  const defaultNeeds = {
    hunger: 80,
    energy: 80,
    social: 80,
    happiness: 80
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!characterForm.name || !characterForm.occupation || 
        !characterForm.mbti || !characterForm.age || 
        !characterForm.hobby || !characterForm.gender ||
        characterForm.characteristics.some(char => !char) ||
        characterForm.goals.some(goal => !goal)) {
      alert("Please fill in all fields")
      return
    }
    onSubmit({
      ...characterForm,
      needs: defaultNeeds
    })
  }

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * presets.characters.length)
    const randomCharacter = {
      ...presets.characters[randomIndex],
      needs: defaultNeeds,
      goals: ["Learn AI", "Make new friends", "Buy a house"]
    }
    setCharacterForm(randomCharacter)
  }

  if (!showModal) return null

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Create Character</h2>
        <button
          type="button"
          onClick={handleRandomize}
          className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 flex items-center gap-2"
        >
          <span>🎲</span> Random
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          required
          className="w-full mb-2 p-2 border rounded"
          placeholder="Name"
          value={characterForm.name}
          onChange={e => setCharacterForm(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          required
          className="w-full mb-2 p-2 border rounded"
          placeholder="Occupation"
          value={characterForm.occupation}
          onChange={e => setCharacterForm(prev => ({ ...prev, occupation: e.target.value }))}
        />
        <input
          required
          className="w-full mb-2 p-2 border rounded"
          placeholder="MBTI"
          value={characterForm.mbti}
          onChange={e => setCharacterForm(prev => ({ ...prev, mbti: e.target.value }))}
        />
        <input
          required
          type="number"
          className="w-full mb-2 p-2 border rounded"
          placeholder="Age"
          value={characterForm.age}
          onChange={e => setCharacterForm(prev => ({ ...prev, age: e.target.value }))}
        />
        <input
          required
          className="w-full mb-2 p-2 border rounded"
          placeholder="Hobby"
          value={characterForm.hobby}
          onChange={e => setCharacterForm(prev => ({ ...prev, hobby: e.target.value }))}
        />
        <select
          required
          className="w-full mb-2 p-2 border rounded"
          value={characterForm.gender}
          onChange={e => setCharacterForm(prev => ({ ...prev, gender: e.target.value }))}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <div className="mb-2">
          <p className="mb-1">Characteristics:</p>
          {characterForm.characteristics.map((char, index) => (
            <input
              key={index}
              required
              className="w-full mb-1 p-2 border rounded"
              placeholder={`Characteristic ${index + 1}`}
              value={char}
              onChange={e => {
                const newChars = [...characterForm.characteristics]
                newChars[index] = e.target.value
                setCharacterForm(prev => ({ ...prev, characteristics: newChars }))
              }}
            />
          ))}
        </div>
        <div className="mb-2">
          <p className="mb-1">Goals:</p>
          {characterForm.goals.map((goal, index) => (
            <input
              key={index}
              required
              className="w-full mb-1 p-2 border rounded"
              placeholder={`Goal ${index + 1}`}
              value={goal}
              onChange={e => {
                const newGoals = [...characterForm.goals]
                newGoals[index] = e.target.value
                setCharacterForm(prev => ({ ...prev, goals: newGoals }))
              }}
            />
          ))}
        </div>
        <div className="mb-2">
          <p className="mb-1">Initial Needs:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Hunger: 80</label>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-blue-500 h-2 rounded" style={{width: '80%'}}></div>
              </div>
            </div>
            <div>
              <label className="text-sm">Energy: 80</label>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-green-500 h-2 rounded" style={{width: '80%'}}></div>
              </div>
            </div>
            <div>
              <label className="text-sm">Social: 80</label>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-yellow-500 h-2 rounded" style={{width: '80%'}}></div>
              </div>
            </div>
            <div>
              <label className="text-sm">Happiness: 80</label>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-pink-500 h-2 rounded" style={{width: '80%'}}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 