import { Link } from "gatsby";
import PropTypes from "prop-types";
import React from "react";
import { Navbar, Nav } from "react-bootstrap";

interface HeaderArgs {
  siteTitle: string;
}

const Header = (args: HeaderArgs) => (
  <>
    <Navbar bg="light" expand="lg">
      <Navbar.Brand>
        <Link className="link-no-style" to="/">
          {args.siteTitle}
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Link className="link-no-style" to="/">
            Home
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  </>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: `Rescribe`,
};

export default Header;
