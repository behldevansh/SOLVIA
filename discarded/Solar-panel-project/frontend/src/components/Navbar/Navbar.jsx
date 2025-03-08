import React, {useState} from 'react'
import NSUT_logo from "./logo_img/NsutLogo.png"
import {Link} from "react-router-dom"
import {FaGripLines} from "react-icons/fa"
import { useSelector } from 'react-redux'

const Navbar = () => {
  const links = [
    {
      title: "Home",
      link: "/",
    },
    {
      title: "About Us",
      link: "/about-us",
    },
    {
      title: "Contact",
      link: "/contact",
    },
    {
      title: "Form",
      link: "/form",
    },
    {
      title: "Profile",
      link: "/profile",
    },
  ]

  const isLoggedIn= useSelector((state)=> state.auth.isLoggedIn)
  if(isLoggedIn === false){
    links.splice(3,2) // from 2nd index cut 2 elements -> cart and profile
  }

  const [MobileNav, setMobileNav] = useState("hidden")

  return (
    <>
      <nav className='relative z-50 bg-zinc-800 text-white px-8 py-4 flex items-center justify-between '>
        <div className='flex items-center'>
          <img src={NSUT_logo} alt="" className='h-20' />
          <h1 className='text-2xl font-semibold'>&nbsp; &nbsp; LoremIpsum</h1>
        </div>
        <div className='nav-links-solar block md:flex items-center gap-4'>
          <div className='hidden md:flex gap-10'>
          {links.map((items, i) => (
            <div className='flex items-center'>
              {items.title === "Profile"? (
              <Link to={items.link} 
              className='px-4 py-1 border text-2xl border-blue-500 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300 hover:text-blue-500 border border-blue-500 transition-all duration-300 ' 
              key={i}>
              {items.title}{""} 
              </Link> ):(
                <Link to={items.link} 
                className='hover:text-blue-500 text-2xl transition-all duration-300 ' 
                key={i}>
                {items.title}{""} 
                </Link>
              )}
            </div>
          ))}
          </div>
          {isLoggedIn === false && (
            <div className='hidden md:flex gap-5'>
              <Link to="/LogIn" 
              className='px-4 py-1 text-2xl border border-blue-500 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300'>LogIn</Link>
              <Link to="/SignUp" 
              className='px-4 py-1 text-2xl bg-blue-500 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300'>SignUp</Link>
            </div>
          )}
          <div>
            <button className='block md:hidden text-white text-2xl hover:text-zinc-400' onClick={()=>MobileNav === "hidden" ? setMobileNav("block"): setMobileNav("hidden")}>
              <FaGripLines/>
            </button>
          </div>
        </div>
      </nav>
      <div className={` ${MobileNav} absolute z-40 bg-zinc-800 h-screen w-full top-0 left-0 flex flex-col items-center justify-center`}>
      {links.map((items, i) => (
        <Link to={items.link} 
        className={` ${MobileNav} text-white text-4xl mb-8 font-semibold hover:text-blue-500 transition-all duration-300 `} key={i}
        onClick={()=>MobileNav === "hidden" ? 
        setMobileNav("block"): setMobileNav("hidden")}
        >{items.title} </Link>
      ))}
      <Link to="/LogIn" 
        className={` ${MobileNav} mb-8 text-3xl font-sesmibold px-8 py-2 border border-blue-500 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300`}>LogIn
      </Link>
      <Link to="/SignUp" 
      className={` ${MobileNav} mb-8 text-3xl font-sesmibold px-8 py-2 bg-blue-500 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300`}>SignUp
      </Link>
    </div>
    </>
    
  )
}

export default Navbar
