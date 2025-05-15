import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function StaffLogin() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('https://sabstimetable.onrender.com/api/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('staff_logged_in', 'true')
        navigate('/staff-dashboard')
      } else {
        setError('Invalid passcode. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      setError('Server error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#141e30] to-[#243b55] flex justify-center items-center">
      <Link 
        to="/" 
        className="absolute top-5 left-5 bg-[bisque] text-black rounded px-4 py-2 font-bold hover:bg-[#e6c7a5] transition-colors"
      >
        Back
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Staff Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="passcode" className="block text-gray-700">Enter Passcode:</label>
            <input
              type="password"
              id="passcode"
              maxLength="4"
              placeholder="Enter 4-digit passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-600 transition-transform hover:scale-105"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default StaffLogin