import React from 'react'
import Styles from './Header.module.css'
import Link from '@material-ui/core/Link';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import GitHubIcon from '@material-ui/icons/GitHub';

function Icons() {
    return (
        <div className={Styles.iconHeader}>
            <p className={Styles.iconsTitle}>See Roger's Profiles</p>
            <Link href="https://www.linkedin.com/in/roger-cerpa/" target="blank">
                <LinkedInIcon fontSize="small" className={Styles.icons}/>
            </Link>
            
            <Link href="https://github.com/rogercerpa" target="blank">
                <GitHubIcon fontSize="small" className={Styles.icons}/>
            </Link>
            
        </div>
    )
}

export default Icons
