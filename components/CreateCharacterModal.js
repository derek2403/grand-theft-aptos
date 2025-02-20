import React, { useState } from 'react'
import presets from '../data/presets.json'
import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

export function CreateCharacterModal({ 
  showModal, 
  onClose = () => {},
  onSubmit = (form) => console.log('Form submitted:', form)
}) {
  const [characterForm, setCharacterForm] = useState({
    name: '',
    occupation: '',
    mbti: '',
    hobby: '',
    gender: '',
    characteristics: ['', '', '', '', ''],
    goals: ['', '', ''],
    needs: {
      hunger: 80,
      energy: 80,
      social: 80,
      happiness: 80
    },
    walletAddress: '0x6efb01899fcd73e335bf24178ddb82f8d400ae533f8c44790b067f0821c1d1ad'
  })
  const [twitterHandle, setTwitterHandle] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const defaultNeeds = {
    hunger: 80,
    energy: 80,
    social: 80,
    happiness: 80
  }

  const handleTwitterAnalysis = async () => {
    if (!twitterHandle) {
      setError('Please enter a Twitter handle')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('/api/analyze-twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: twitterHandle }),
      })

      const data = await response.json()
      console.log('Twitter Analysis Response:', data)
      
      if (data.success && data.profile && data.analysis) {
        const newCharacterForm = {
          name: data.profile.name || '',
          occupation: data.analysis.occupation || '',
          mbti: data.analysis.mbti || '',
          hobby: data.analysis.hobby || '',
          gender: data.analysis.gender || '',
          characteristics: data.analysis.characteristics || ['', '', '', '', ''],
          goals: data.analysis.goals || ['', '', ''],
          needs: defaultNeeds,
          walletAddress: '0x6efb01899fcd73e335bf24178ddb82f8d400ae533f8c44790b067f0821c1d1ad'
        }
        console.log('Setting character form:', newCharacterForm)
        setCharacterForm(newCharacterForm)
      } else {
        setError(data.error || 'Failed to analyze Twitter profile')
      }
    } catch (error) {
      console.error('Twitter Analysis Error:', error)
      setError('Failed to analyze Twitter profile')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!characterForm.name || !characterForm.occupation || 
        !characterForm.mbti || !characterForm.hobby || 
        !characterForm.gender || 
        !characterForm.characteristics.every(c => c) || 
        !characterForm.goals.every(g => g)) {
      return
    }
    onSubmit(characterForm)
    onClose()
  }

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * presets.characters.length)
    const randomCharacter = {
      ...presets.characters[randomIndex],
      needs: defaultNeeds,
      goals: ["Learn AI", "Make new friends", "Buy a house"],
      walletAddress: '0x6efb01899fcd73e335bf24178ddb82f8d400ae533f8c44790b067f0821c1d1ad'
    }
    setCharacterForm(randomCharacter)
  }

  if (!showModal) return null

  return (
    <Dialog
      open={showModal}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-white/90" aria-hidden="true" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <Dialog.Panel className="bg-white text-gray-800 p-8 rounded-xl shadow-2xl w-[900px] h-[600px] overflow-hidden border border-indigo-100 flex gap-8">
          <div className="w-1/3 bg-gradient-to-b from-indigo-50 to-purple-50 rounded-lg overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-indigo-950 p-4">Character Preview</h3>
            <div className="flex-1 relative w-full">
              {characterForm.gender ? (
                <Image
                  src={`/${characterForm.gender === 'male' ? 'boy' : 'girl'}.png`}
                  alt="Character avatar"
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-indigo-400" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-3xl font-bold text-indigo-950">
                Create Your Character
              </Dialog.Title>
            </div>

            <div className="mb-4 p-4 border rounded">
              <h3 className="text-lg mb-2">Import from Twitter</h3>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-2 border rounded"
                  placeholder="Enter Twitter handle"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                />
                <button
                  onClick={handleTwitterAnalysis}
                  disabled={isAnalyzing}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Import'}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
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
        </Dialog.Panel>
      </motion.div>
    </Dialog>
  )
} 