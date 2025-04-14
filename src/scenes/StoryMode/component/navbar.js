import { useState, useEffect } from "react";
import Options from '../../../scenes/Option/Option';
import './navbar.css';

export default function Navbar() {

  return (
    <div class="navbar">
      <button className="navbar-auto">
        <p>auto</p>
      </button>
      <button className="navbar-skip">
        <p>skip</p>
      </button>
      <button className="navbar-log">
        <p>log</p>
      </button>
      <button className="navbar-config">
        <p>config</p>
      </button>
    </div>
  );
}