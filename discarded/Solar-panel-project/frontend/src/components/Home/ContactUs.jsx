import React from 'react'
import axios from 'axios'
const ContactUs = () => {
  return (
    <div className='px-6 bg-zinc-900'>
      <h4 className='text-5xl font-semibold text-yellow-100 text-center underline underline-offset-8 py-6 mb-72 md:mb-0'>Contact Us</h4>
        
        <div className='h-[75vh] flex flex-col lg:flex-row items-center justify-center'>
          <div className='w-full lg:w-3/6 mb-12 md:mb-0 flex flex-col items-center lg:items-start justify-center'>
          <h1 className='text-2xl lg:text-5xl font-semibold text-zinc-300 text-center lg:text-left mb-10 text-shadow'>Get In Touct With Us</h1>
          <h1 className='text-xl lg:text-2xl font-semibold text-yellow-100 text-center lg:text-left'>Write to us at info@ai4icps.in. Better yet, see us in person!</h1>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Feel free to visit during normal business hours.</p>
            <h1 className='text-xl mt-4 lg:text-2xl font-semibold text-yellow-100 text-center lg:text-left'>Netaji Subhas University of Technology</h1>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Netaji Subhas University of Technology, Azad Hind Fauj Marg, Sector - 3 , Dwarka, New Delhi - 110078, India</p>
          </div>
          <div className='w-full lg:w-3/6 mb-72 md:mb-0 flex flex-col items-center lg:items-start justify-center'>
            <h1 className='text-xl lg:text-2xl font-semibold text-yellow-100 text-center lg:text-left'>Frequently Asked Questions</h1>
            <p className='mt-4 text-xl text-zinc-100 text-center lg:text-left'>Q: Lorem ipsum dolor sit amet consectetur.</p>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Ans: Lorem ipsum dolor sit amet consectetur adipisicing.</p>
            <p className='mt-4 text-xl text-zinc-100 text-center lg:text-left'>Q: Lorem ipsum dolor sit amet consectetur.</p>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Ans: Lorem ipsum dolor sit amet consectetur adipisicing.</p>
            <p className='mt-4 text-xl text-zinc-100 text-center lg:text-left'>Q: Lorem ipsum dolor sit amet consectetur.</p>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Ans: Lorem ipsum dolor sit amet consectetur adipisicing.</p>
            <p className='mt-4 text-xl text-zinc-100 text-center lg:text-left'>Q: Lorem ipsum dolor sit amet consectetur.</p>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Ans: Lorem ipsum dolor sit amet consectetur adipisicing.</p>
            
          </div>
          
      </div>
      <div className='mt-12  md:mt-0'>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.6279074316753!2d77.03587817535761!3d28.61093747567646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d05dd375e5a13%3A0x108adaa3abe4bd07!2sNetaji%20Subhas%20University%20of%20Technology!5e0!3m2!1sen!2sin!4v1721110680907!5m2!1sen!2sin" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" className="h-[350px] w-full"></iframe>
          </div>
    </div>
  )
}

export default ContactUs