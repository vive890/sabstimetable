import { Link } from 'react-router-dom'
import { FaUserGraduate, FaChalkboardTeacher, FaUserCog } from 'react-icons/fa'
import { useState, useEffect } from 'react'

function Home() {
  const [datetime, setDatetime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setDatetime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#141e30] to-[#243b55] text-center">
      <header className="bg-[#0f172a] border-b-3 border-[#704a45] p-5">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase shadow-[0_0_10px_#704a45,0_0_20px_#6c4744,0_0_40px_#483131]">
          Seshadripuram Academy Of Business Studies
        </h1>
        <p className="text-white text-lg mt-2">
          {datetime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </header>

      <section className="mt-16">
        <h2 className="text-4xl font-bold text-white uppercase animate-fadeIn shadow-[0_0_10px_#704a45,0_0_20px_#6c4744,0_0_40px_#483131]">
          Time Table
        </h2>
      </section>

      <div className="mt-12 space-y-8">
        <Link to="/course">
          <button className="w-48 h-24 bg-[rgb(153,247,228)] text-black rounded-lg font-bold text-2xl border-3 border-[#0f172a] shadow-[0_0_15px_#704a45,0_0_30px_#704a45,0_0_60px_#6c4744] transition-transform hover:scale-110 hover:bg-[#a0f0db] flex flex-col items-center justify-center">
            <FaUserGraduate className="text-3xl mb-2" />
            STUDENT
          </button>
        </Link>

        <Link to="/login-staff">
          <button className="w-48 h-24 bg-[rgb(153,247,228)] text-black rounded-lg font-bold text-2xl border-3 border-[#0f172a] shadow-[0_0_15px_#704a45,0_0_30px_#704a45,0_0_60px_#6c4744] transition-transform hover:scale-110 hover:bg-[#a0f0db] flex flex-col items-center justify-center">
            <FaChalkboardTeacher className="text-3xl mb-2" />
            STAFF
          </button>
        </Link>

        <Link to="/login-admin">
          <button className="w-48 h-24 bg-[rgb(153,247,228)] text-black rounded-lg font-bold text-2xl border-3 border-[#0f172a] shadow-[0_0_15px_#704a45,0_0_30px_#704a45,0_0_60px_#6c4744] transition-transform hover:scale-110 hover:bg-[#a0f0db] flex flex-col items-center justify-center">
            <FaUserCog className="text-3xl mb-2" />
            ADMIN
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Home