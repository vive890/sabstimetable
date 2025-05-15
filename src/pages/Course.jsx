import { Link } from 'react-router-dom'

function Course() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#141e30] to-[#243b55] p-6">
      <Link to="/" className="inline-block bg-[bisque] text-black rounded px-4 py-2 font-bold hover:bg-[#e6c7a5] transition-colors">
        Back
      </Link>
      
      <hr className="my-6" />

      <div className="text-center">
        <h1 className="text-4xl font-bold text-white uppercase mb-8 shadow-[0_0_10px_#704a45,0_0_20px_#6c4744,0_0_40px_#483131]">
          SELECT COURSE
        </h1>

        <div className="space-y-6">
          <Link to="/course/bca">
            <button className="w-48 h-24 bg-[aquamarine] text-black rounded-lg font-bold text-3xl border-2 border-black hover:opacity-90 transition-transform hover:scale-105">
              BCA
            </button>
          </Link>

          <br />

          <Link to="/course/bba">
            <button className="w-48 h-24 bg-[aquamarine] text-black rounded-lg font-bold text-3xl border-2 border-black hover:opacity-90 transition-transform hover:scale-105">
              BBA
            </button>
          </Link>

          <br />

          <Link to="/course/bcom">
            <button className="w-48 h-24 bg-[aquamarine] text-black rounded-lg font-bold text-3xl border-2 border-black hover:opacity-90 transition-transform hover:scale-105">
              B.COM
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Course