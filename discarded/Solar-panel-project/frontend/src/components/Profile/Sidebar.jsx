import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {FaArrowRightFromBracket} from "react-icons/fa6"
import { useDispatch } from 'react-redux'
import { authActions } from "../../store/auth"
const Sidebar = ({data}) => {
  const dispatch = useDispatch()
  const history = useNavigate()
  return (
    <div className='bg-zinc-800 rounded p-4 flex flex-col items-center justify-between h-[60%]'>
      <div className='flex flex-col items-center justify-center'>
        <img src={data.avatar} alt="" className='h-[12vh]' />
        <p className='mt-3 text-zinc-100 font-semibold text-xl '>{data.username}</p>
        <p className='mt-1 text-zinc-300 text-normal '>{data.email}</p>
        <div className='bg-zinc-500 hidden lg:block mt-4 h-[1px] w-full text-center'></div>
      </div>
      <div className='w-full flex-col items-center justify-center hidden lg:flex'>
        <Link to="/profile/predictHistory"
        className='w-full mt-4 py-2 text-center text-zinc-100 font-semibold hover:bg-zinc-900 rounded transition-all duration-300'
        >
          Predict History
        </Link>
        <Link to="/profile/settings"
        className='w-full mt-4 py-2 text-center text-zinc-100 font-semibold hover:bg-zinc-900 rounded transition-all duration-300'
        >
          Settings
        </Link>
      </div>
      <button className='bg-zinc-900 w-3/6 lg:w-full text-white font-semibold mt-4 lg:mt-0 flex items-center justify-center py-2 hover:bg-white hover:text-zinc-900 rounded transition-all duration-300'
      onClick={()=>{
        dispatch(authActions.logout())
        localStorage.clear("id")
        localStorage.clear("token")
        history("/")
      }}
      >Log Out &nbsp; <FaArrowRightFromBracket classNamem="ms-4" /></button>
    </div>
  )
}

export default Sidebar