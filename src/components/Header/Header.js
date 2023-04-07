import React from "react";
import Link from "next/link";
import { headerInfo } from "../../constants/constants";

import { Container, OptionStyle } from "./HeaderStyles";

export default function Header() {
  const Options = headerInfo.map(({ id, option }) => {
    return (
      <ul key={id}>
        <OptionStyle>{option}</OptionStyle>
      </ul>
    );
  });

  return (
    <Container>
      <img src="../public/logo/android-chrome-512x512.png" />
      <Link href="./">Cerpamedia</Link>
      {Options}
    </Container>
  );
}
