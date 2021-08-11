import { React } from 'react';
import Styles from './Header.module.css'
import Link from 'next/link'


function Header() {

  return (
        
    <div className={Styles.logoHeader}> 
      <Link href="/"><a><img
              height={100}
              width={100}
              src='/CerpaMediaLogo2.svg'
              atl="CerpaMedia-Logo"
              priority
      /></a></Link>
      <ul className={Styles.navigation}>
        <il><Link href="/AboutUs"><a>About Us</a></Link></il>
        <il><Link href="/Services"><a>Services</a></Link></il>
        <il><Link href="/ContactUs"><a>Contact Us</a></Link></il>
      </ul>
    </div>
    
    )
}

export default Header
