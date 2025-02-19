import React from 'react'

export function CharactersListModal({ 
  showModal, 
  onClose, 
  characters 
}) {
  if (!showModal) return null

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl mb-4">Characters List</h2>
      {characters.map(char => (
        <div key={char.id} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-bold">{char.name}</h3>
          <p>Occupation: {char.occupation}</p>
          <p>MBTI: {char.mbti}</p>
          <p>Age: {char.age}</p>
          <p>Hobby: {char.hobby}</p>
          <p>Gender: {char.gender}</p>
          <div>
            <p className="font-bold">Characteristics:</p>
            <ul className="list-disc pl-5">
              {char.characteristics.map((trait, index) => (
                <li key={index}>{trait}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      <button
        onClick={onClose}
        className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mt-4"
      >
        Close
      </button>
    </div>
  )
} 