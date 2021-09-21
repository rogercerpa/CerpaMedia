import Link from 'next/link';
import React from 'react';
import { AiFillGithub, AiFillInstagram, AiFillLinkedin } from 'react-icons/ai';
import {TiMediaPlayOutline} from 'react-icons/ti'
import { DiCssdeck } from 'react-icons/di';

import { Container, Div1, Div2, Div3, NavLink, SocialIcons, Span } from './HeaderStyles';

const Header = () =>  (
  <Container>
    <Div1>
      <Link href="/">
      <a style={{ display: "flex", alignItems: "center",  color: "white", marginBottom:"10px" }}>
        <TiMediaPlayOutline size="6rem" /> <Span>CerpaMedia</Span>
      </a>
      </Link>
    </Div1>
        <Div3>

      <SocialIcons >
        <a href="https://github.com/rogercerpa" target="_blank" style={{ display: "flex", alignItems: "center", flexDirection: "column", color: "white" }} rel="noopener">
          <AiFillGithub size="3rem" />
        </a>
      </SocialIcons>

        <SocialIcons >
        <a href="https://www.linkedin.com/in/roger-cerpa/" target="_blank" style={{ display: "flex", alignItems: "center", flexDirection: "column", color: "white" }} rel="noopener">
          <AiFillLinkedin size="3rem" />
        </a>
      </SocialIcons>

        <SocialIcons >
        <a href="https://www.instagram.com/cerpamedia/" target="_blank" style={{ display: "flex", alignItems: "center", flexDirection: "column", color: "white" }} rel="noopener">
          <AiFillInstagram size="3rem" />
        </a>
      </SocialIcons>



    </Div3>
 </Container>
);

export default Header;
