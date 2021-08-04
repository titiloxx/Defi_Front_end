import React from "react";
import { Navbar,Container } from 'react-bootstrap';
import Identicon from 'react-identicons';



interface NavProps{
address:string
}

const Nav=({address}:NavProps)=>(
    <>
     <Navbar bg="dark" variant="dark">
    <Container>
    <Navbar.Brand href="#home">The Loxx Token</Navbar.Brand>
    <Navbar.Collapse className="justify-content-end">
      <Navbar.Text>
        {address}
      </Navbar.Text>
      <Identicon
        className='userImage'
        string={address}
        />
    </Navbar.Collapse>
    </Container>
  </Navbar>
  </>)
  export default Nav