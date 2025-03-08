import React, {useState} from 'react'
import Sidebar from "../components/Profile/Sidebar"
import { useEffect } from 'react'
// import { useSelector } from 'react-redux'
import axios from "axios"
import { Outlet } from 'react-router-dom'
import Loader from '../components/Loader/Loader'

const Profile = () => {
  // const isLoggedIn = useSelector()
  const [Profile, setProfile] = useState()

  const headers = {
    id : localStorage.getItem("id"),
    authorization : `bearer ${localStorage.getItem("token")}`,
  }
  useEffect(()=>{
    const fetch = async ()=>{
      const response = await axios.get("http://localhost:8040/api/v1/get-user-information", {headers})
      setProfile(response.data)
    }
    fetch()
  }, [])

  return (
    <div className='bg-zinc-900 px:2 md:px-12 flex flex-col md:flex-row h-screen py-8 gap-4 text-white'>
      {!Profile && <div className='w-full h-[100%] flex items-center justify-center'> <Loader></Loader> </div>}
      {Profile && (
        <>
          <div className='w-full md:w-1/6'>
          <Sidebar data={Profile}></Sidebar>
          </div>
          <div className='w-full md:w-5/6'>
            <Outlet></Outlet>
          </div>
        </>
      )}
    </div>
  )
}

export default Profile