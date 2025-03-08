import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
const Hero = () => {
  const isLoggedIn= useSelector((state)=> state.auth.isLoggedIn)
  return (
    <div className='h-[75vh] flex flex-col md:flex-row items-center justify-center'>
      <div className='w-full lg:w-3/6 mb-12 md:mb-0 flex flex-col items-center lg:items-start justify-center'>
        <h1 className='text-4xl lg:text-7xl font-semibold text-yellow-100 text-center lg:text-left'>Lorem ipsum dolor sit amet consectetur.</h1>
        <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Necessitatibus ex possimus, quisquam veritatis assumenda rem?</p>
        <div className='mt-8'>
          {isLoggedIn === false && (
            <Link to="/LogIn" className='text-yellow-100 border border-yellow-100 lg:text-2xl text-xl font-semibold px-10 py-3 hover:bg-zinc-800 rounded-full'>Predict</Link>
          )}
          {isLoggedIn === true && (
            <Link to="/form" className='text-yellow-100 border border-yellow-100 lg:text-2xl text-xl font-semibold px-10 py-3 hover:bg-zinc-800 rounded-full'>Predict</Link>
          )}
        </div>
        
      </div>
      <div className='w-full lg:w-3/6 h:auto lg:h-[100%] flex items-center justify-center'>
        <img src="./solarPanel.jpg" alt="hero" className='w-[468px] h-[336px] rounded' />
      </div>
    </div>
  )
}

export default Hero
