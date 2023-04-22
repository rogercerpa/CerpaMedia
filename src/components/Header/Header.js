// Header.js
import React from "react";
import Link from "next/link";
import { headerInfo } from "../../constants/constants";

import {
  Container,
  OptionStyle,
  Logo,
  BrandName,
  LogoAndBrand,
  NavList,
} from "./HeaderStyles";

export default function Header() {
  const Options = headerInfo.map(({ id, option }) => {
    return (
      <li key={id}>
        <Link href="/" passHref>
          <OptionStyle>{option}</OptionStyle>
        </Link>
      </li>
    );
  });

  return (
    <Container>
      <LogoAndBrand>
        <Link href="/" passHref>
          <Logo src="/logo/android-chrome-512x512.png" alt="Logo" />
        </Link>
        <Link href="./" passHref>
          <BrandName>Cerpamedia</BrandName>
        </Link>
      </LogoAndBrand>
      <NavList>{Options}</NavList>
    </Container>
  );
}
