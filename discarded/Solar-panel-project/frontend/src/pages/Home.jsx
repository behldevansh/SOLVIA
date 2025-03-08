import React from 'react'
import Hero from '../components/Home/Hero'
import AboutUs from '../components/Home/AboutUs'
import ContactUs from "../components/Home/ContactUs"
const Home = () => {
  return (
    <div className='bg-zinc-900  text-white px-10 py-8'>
      <Hero></Hero>
      <AboutUs></AboutUs>
      <ContactUs></ContactUs>
    </div>
  )
}

export default Home
