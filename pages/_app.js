import '../styles/globals.css'
import Header from "../components/Header/Header"
import Icons from '../components/Header/Icons'


function MyApp({ Component, pageProps }) {

  return (
    <div className="container">
      
        <Icons></Icons>
     
        <Header></Header>
     
      <Component {...pageProps} />
    </div>
  )
  
}

export default MyApp
