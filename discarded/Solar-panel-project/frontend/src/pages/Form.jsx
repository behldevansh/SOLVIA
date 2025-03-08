
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios"

const Form = () => {
  const [Values, setValues] = useState({
      lastCleaned : "", 
      panelArea: "", 
      labourCost: "",
  })

  const navigate =  useNavigate()

  const change = (e)=>{
    const {name, value} = e.target
    setValues({...Values, [name]: value})
  }

  const submit = async ()=>{
    try{
      if(Values.lastCleaned === "" || Values.panelArea === "" || Values.labourCost === ""){
        alert("All fields all required")
      }
      else{
        const response = await axios.post("http://localhost:8040/api/v1/form", Values)
        alert(response.data.message)
        navigate("/")
      }
    }
    catch(error){
      alert(error.response.data.message)
    }
  }

  return (
    <div className='h-auto bg-zinc-900 px-12 py-8 flex items-center justify-center'>
      <div className='px-8 py-5 w-full md:w-3/6 lg:w-2/6 rounded-lg bg-zinc-800'>
        <p className='text-zinc-200 text-xl'>Predict</p>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Last Cleaned</label>
            <input type='date'  placeholder='Last cleaned' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none ' name='lastCleaned' required value={Values.lastCleaned} onChange={change}></input>
          </div>
        </div>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Panel Area</label>
            <input type='number' placeholder='in square meters' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none' name='panelArea' required value={Values.panelArea} onChange={change}></input>
          </div>
        </div>
        <div className='mt-4'>
          <div>
            <label htmlFor='' className='text-zinc-400'>Labour Cost</label>
            <input type='number' placeholder='in rupees' className='w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none' name='labourCost' required value={Values.labourCost} onChange={change}></input>  
          </div>
        </div>
        <div className='mt-4'>
          <button className='bg-blue-500 w-full text-white font-semibold py-2 rounded hover:bg-white hover:text-zinc-800' onClick={submit}>Submit</button>
        </div>
      </div>
    </div>
  )
}

export default Form