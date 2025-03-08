import React from 'react'
import axios from 'axios'
const AboutUs = () => {
  return (
    <div className='bg-zinc-900 px-10 '>
      <h4 className='text-5xl font-semibold text-yellow-100 text-center underline underline-offset-8 py-6'>About Us</h4>
        
        <div className='h-[75vh] flex flex-col lg:flex-row items-center  justify-center'>
          <div className='w-full lg:w-3/6 h:auto lg:h-[100%] flex items-center justify-start'>
            <img src="./NsutLogo.png" alt="hero" className='h-[320px] w-[320px]'/>
            <img src="./iitK.png" alt="hero" className='w-[305px] h-[375px]'  />
          </div>
          <div className='w-full lg:w-3/6 mb-12 md:mb-0 flex flex-col items-center lg:items-start justify-center'>
            <h1 className='text-xl lg:text-2xl font-semibold text-yellow-100 text-center lg:text-left'>Lorem ipsum dolor sit amet.</h1>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Delectus soluta iusto enim saepe? Mollitia consectetur distinctio ad, quod, earum atque inventore quis aspernatur nostrum amet dolorum asperiores cupiditate minus voluptatibus rerum explicabo iusto magnam aperiam! Dolorum nihil facere tenetur expedita.</p>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Delectus soluta iusto enim saepe? </p>
            
          </div>
      </div>
    </div>
  )
}

export default AboutUs
