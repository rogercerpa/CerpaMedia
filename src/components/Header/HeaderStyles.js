import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;

  @media ${(props) => props.theme.breakpoints.sm} {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 60px);
    grid-column-gap: 0.5rem;
    grid-row-gap: 0.5rem;
  }
`;

export const OptionStyle = styled.a`
  font-size: 1.5rem;
  color: white;
  text-decoration: none;
  cursor: pointer;
  margin-right: 1rem;

  &:hover {
    color: white;
    font-size: 2rem;
  }
`;

export const LogoAndBrand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const LogoWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
`;

export const BrandName = styled.a`
  font-size: 2rem;
  color: white;
  text-decoration: none;
  cursor: pointer;
  margin-left: 0.5rem; // Add spacing between the logo and the brand name

  &:hover {
    color: white;
  }
`;

export const NavList = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;
