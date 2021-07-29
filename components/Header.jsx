import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
// import Image from 'next/image'
// import CerpaMediaLogo from '../public/CerpaMediaLogo2.png'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
      },
}));

function Header() {
    const classes = useStyles();
    return (
        
      <div className={classes.root}>
        
        
      <AppBar color="transparent">
                <Toolbar>
            <img
              height={200}
              width={200}
              src='/CerpaMediaLogo2.svg'
              atl="CerpaMedia-Logo"
              priority
            />
             {/* <h1>CerpaMedia</h1>  */}
            
          </Toolbar>
  
      </AppBar>
    </div>
    
    )
}

export default Header
