import React, { useState } from 'react';
import { Container, Navbar, Nav, Offcanvas, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SignOutLink from './accounts/components/SignOutLink';
import LoginButton from './accounts/components/LoginButton';
import './styles/Masthead.css';

function Masthead({ loggedIn }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleToggle = () => setShow((prevShow) => !prevShow);

  return (
    <Navbar expand="lg" className="mb-3" variant="dark" bg="dark" fixed="top">
      <Container fluid>
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-lg" onClick={handleToggle} />
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-lg"
          aria-labelledby="offcanvasNavbarLabel-expand-lg"
          placement="start"
          show={show}
          onHide={handleClose}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-start flex-grow-1 pe-3">
              <Nav.Link as={Link} to="/" onClick={handleClose}>Home</Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
        {loggedIn && (
          <Dropdown align="end">
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
              Profile
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/profile" onClick={handleClose}>Profile</Dropdown.Item>
              <Dropdown.Item as={Link} to="/settings" onClick={handleClose}>Settings</Dropdown.Item>
              <SignOutLink />
            </Dropdown.Menu>
          </Dropdown>
        )}

        {!loggedIn && (
          <Nav>
            <Nav.Item><LoginButton /></Nav.Item>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
}

export default Masthead;
