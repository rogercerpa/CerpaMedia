import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoImage from "../../../public/Logo/logo.png";
import { headerInfo } from "../../constants/constants";
import {
  Container,
  OptionStyle,
  LogoWrapper,
  BrandName,
  LogoAndBrand,
  NavList,
} from "./HeaderStyles";

export default function Header() {
  const Options = headerInfo.map(({ id, option, href }) => {
    return (
      <li key={id}>
        <Link href={href} passHref>
          <OptionStyle>{option}</OptionStyle>
        </Link>
      </li>
    );
  });

  return (
    <Container>
      <LogoAndBrand>
        <Link to="/" passHref>
          <LogoWrapper>
            <Image src={logoImage} alt="Logo" width={48} height={48} />
          </LogoWrapper>
        </Link>
        <Link to="/" passHref>
          <BrandName>CerpaMedia</BrandName>
        </Link>
      </LogoAndBrand>
      <NavList>{Options}</NavList>
    </Container>
  );
}
