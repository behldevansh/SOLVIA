import React, { useState } from 'react'
import { Link , useNavigate} from 'react-router-dom'
import { authActions } from '../store/auth'
import { useDispatch } from 'react-redux'
import axios from "axios"



const LogIn = () => {
  const [Values, setValues] = useState({
    username :"",
    password:"",
  })

  const navigate =  useNavigate()
  const dispatch = useDispatch()

  const change = (e)=>{
    const {name, value} = e.target
    setValues({...Values, [name]: value})
  }

  const submit = async ()=>{
    try{
      if(Values.username === "" || Values.password === ""){
        alert("All fields all required")
      }
      else{
        const response = await axios.post("http://localhost:8040/api/v1/sign-in", Values)
        dispatch(authActions.login())
        // dispatch(authActions.changeRole(response.data.role))
        localStorage.setItem("id" , response.data.id)
        localStorage.setItem("token" , response.data.token)
        // localStorage.setItem("role" , response.data.role)
        navigate("/form")
      }
    }
    catch(error){
      alert(error.response.data.message)
    }
  }

  return (
    
    <div className='h-[85vh] bg-zinc-900 px-12 py-8 flex items-center justify-center'>
      <div className='px-8 py-5 w-full md:w-3/6 lg:w-2/6 rounded-lg bg-zinc-800'>
        <p className='text-zinc-200 text-xl'>LogIn</p>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Username</label>
            <input type='text' placeholder='username' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none' name='username' required value={Values.username} onChange={change}></input>
          </div>
        </div>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Password</label>
            <input type='password' placeholder='password' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none' name='password' required value={Values.password} onChange={change}></input>  
          </div>
        </div>
        <div className='mt-4'>
          <button className='bg-blue-500 w-full text-white font-semibold py-2 rounded hover:bg-white hover:text-zinc-800' onClick={submit}>LogIn</button>
        </div>
        <p className='mt-4 flex items-center justify-center text-zinc-200 font-semibold'>Or</p>
        <p className='mt-4 flex items-center justify-center text-zinc-400 font-semibold'>Don't have an account? &nbsp;
        <Link to="/signup" className='hover:text-blue-500'>
          <p>SignUp</p>
        </Link>
        </p>
      </div>
    </div>
  )
}

export default LogIn
