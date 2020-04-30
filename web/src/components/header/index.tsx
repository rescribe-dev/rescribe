import { Link } from "gatsby";
import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Navbar,
  NavbarToggler,
  Collapse,
  NavLink,
  NavbarBrand,
  Nav,
} from "reactstrap";

interface HeaderArgs {
  siteTitle: string;
}

const Header = (args: HeaderArgs) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <Navbar color="light" light expand="md">
        <NavbarBrand tag={Link} to="/">
          {args.siteTitle}
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavLink tag={Link} to="/">
              Home
            </NavLink>
            <NavLink tag={Link} to="/login">
              Login
            </NavLink>
          </Nav>
        </Collapse>
      </Navbar>
    </>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: `Rescribe`,
};

export default Header;
