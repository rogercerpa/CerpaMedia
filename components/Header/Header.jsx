import { React } from 'react';
import Styles from  './Header.module.css'


function Header() {

  return (
        
    <div className={Styles.logoHeader}> 
      <img
              height={100}
              width={100}
              src='/CerpaMediaLogo2.svg'
              atl="CerpaMedia-Logo"
              priority
      />
      <ul className={Styles.navigation}>
        <il><a href="/About">About Us</a></il>
        <il><a href="/Services">Services</a></il>
        <il><a href="/ContactUs">Contact Us</a></il>
      </ul>
    </div>
    
    )
}

export default Header
