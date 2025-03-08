import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios"

const SignUp = () => {
  const [Values, setValues] = useState({
    username :"",
    email:"",
    password:"",
  })

  const navigate =  useNavigate()

  const change = (e)=>{
    const {name, value} = e.target
    setValues({...Values, [name]: value})
  }

  const submit = async ()=>{
    try{
      if(Values.username === "" || Values.email === "" || Values.password === ""){
        alert("All fields all required")
      }
      else{
        const response = await axios.post("http://localhost:8040/api/v1/sign-up", Values)
        alert(response.data.message)
        navigate("/Login")
      }
    }
    catch(error){
      alert(error.response.data.message)
    }
  }

  return (
    <div className='h-auto bg-zinc-900 px-12 py-8 flex items-center justify-center'>
      <div className='px-8 py-5 w-full md:w-3/6 lg:w-2/6 rounded-lg bg-zinc-800'>
        <p className='text-zinc-200 text-xl'>SignUp</p>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Username</label>
            <input type='text' placeholder='username' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none' name='username' required value={Values.username} onChange={change}></input>
          </div>
        </div>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Email</label>
            <input type='email' placeholder='xyz@example.com' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none' name='email' required value={Values.email} onChange={change}></input>
          </div>
        </div>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Password</label>
            <input type='password' placeholder='password' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none' name='password' required value={Values.password} onChange={change}></input>  
          </div>
        </div>
        <div className='mt-4'>
          <button className='bg-blue-500 w-full text-white font-semibold py-2 rounded hover:bg-white hover:text-zinc-800' onClick={submit}>Sign Up</button>
        </div>
        <p className='mt-4 flex items-center justify-center text-zinc-200 font-semibold'>Or</p>
        <p className='mt-4 flex items-center justify-center text-zinc-400 font-semibold'>Already have an account? &nbsp;
        <Link to="/login" className='hover:text-blue-500'>
          <p>Login</p>
        </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp
