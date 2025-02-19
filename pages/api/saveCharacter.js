import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'NPC.json')
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    // Add new character
    fileData.characters.push(req.body)
    
    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2))
    
    res.status(200).json({ message: 'Character saved successfully' })
  } catch (error) {
    console.error('Error saving character:', error)
    res.status(500).json({ message: 'Error saving character' })
  }
} 