import React from 'react';
import Link from 'next/link';
import { Container, Div1, Div2, Div3, NavLink, SocialIcons, Span, Span1 } from './HeroStyles';
import { Section, SectionText, SectionTitle } from '../../styles/GlobalComponents';
import Button from '../../styles/GlobalComponents/Button';
import { LeftSection } from './HeroStyles';

const Hero = (props) => (
  <Section>
    <SectionTitle>Welcome to CerpaMedia!</SectionTitle>
    <SectionText>Our mission is to bring value and take solutions to the next level. </SectionText>

          <Div2>
      <li>
        <Link href="/AboutUs">
          <NavLink>
            About Us
          </NavLink>
        </Link>
      </li>
       <li>
        <Link href="/OurClients">
          <NavLink>
            Our Clients
          </NavLink>
        </Link>
      </li>
       <li>
        <Link href="/Services">
          <NavLink>
            Services
          </NavLink>
        </Link>
      </li>
      <li>
        <Link href="/ContactUs">
          <NavLink>
            Contact Us
          </NavLink>
        </Link>
      </li>
    </Div2>
  </Section>
  

);

export default Hero;