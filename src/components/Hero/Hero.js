import React from 'react';

import { Section, SectionText, SectionTitle } from '../../styles/GlobalComponents';
import Button from '../../styles/GlobalComponents/Button';
import { LeftSection } from './HeroStyles';

const Hero = (props) => (
  <Section>
    <SectionTitle>Welcome to CerpaMedia!</SectionTitle>
    <SectionText>Roger's mission is to bring value and escalate solutions to the next level. </SectionText>
 </Section>
);

export default Hero;