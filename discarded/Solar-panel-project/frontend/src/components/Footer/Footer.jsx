import React from 'react'
import { Link } from 'react-router-dom'
import { FaLinkedin } from "react-icons/fa"
import { FaGithub } from "react-icons/fa";
import { FaTwitterSquare } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa"
const Footer = () => {
  return (
    <div className='bg-zinc-800 text-white px-8 py-4'>
      <h1 className='text-5xl font-semibold text-center mb-10'>Our Social Media</h1>
        <div className='flex items-center justify-center gap-10 mb-10 text-4xl '>
          <Link >
          <FaLinkedin className='hover:text-5xl hover:shadow-xl hover:dark:shadow-gray-400'/>
          </Link>
          <Link>
          <FaGithub className='hover:text-5xl hover:shadow-xl hover:dark:shadow-gray-400'/>
          </Link>
          <Link>
          <FaTwitterSquare className='hover:text-5xl hover:shadow-xl hover:dark:shadow-gray-400'/>
          </Link>
          <Link>
          <FaYoutube className='hover:text-5xl hover:shadow-xl hover:dark:shadow-gray-400'/>
          </Link>
        </div>
        <div className='flex items-center justify-center gap-10 mb-10 text-2xl '>
          <Link to="/" className='scroll-up'>
            <h1 className='hover:text-blue-500'>Home</h1>
          </Link>
          <Link to="/about-us">
          <h1 className='hover:text-blue-500'>About Us</h1> 
          </Link>
          <Link to="/contact">
          <h1 className='hover:text-blue-500'>Contact us</h1>
          </Link>
        </div>
      <h1 className='text-xl font-semibold text-center'>&copy; 2024, Made by Akshita Aggarwal</h1>
      <p className='text-xl font-semibold text-center'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, error?</p>
    </div>
  )
}

export default Footer
