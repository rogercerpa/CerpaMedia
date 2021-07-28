import React from 'react'
import Link from '@material-ui/core/Link';
import { black } from '@material-ui/core/colors';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import GitHubIcon from '@material-ui/icons/GitHub';

function Icons() {
    return (
        <div>
            <Link href="https://www.linkedin.com/in/roger-cerpa/" target="blank">
                <LinkedInIcon fontSize="large" style={{ color: black }}/>
            </Link>
            
            <Link href="https://github.com/rogercerpa" target="blank">
                <GitHubIcon fontSize="large" style={{ color: black }}/>
            </Link>
            
        </div>
    )
}

export default Icons
