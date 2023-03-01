import React from 'react'

function Menu() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
      <path
        fill='#1E1F22'
        fillRule='evenodd'
        d='M4 6.5a.5.5 0 01.5-.5h15a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1zm0 5a.5.5 0 01.5-.5h15a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1zm.5 4.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h15a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-15z'
        clipRule='evenodd'
      ></path>
    </svg>
  )
}

export default React.memo(Menu)