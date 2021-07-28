import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Icons from "./Icons"
import Image from 'next/image'
import CerpaMediaLogo from '../public/CerpaMediaLogo2.png'

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
                <Image src={CerpaMediaLogo} atl="CerpaMedia-Logo"></Image>
            
          </Toolbar>
  
      </AppBar>
    </div>
    
    )
}

export default Header
