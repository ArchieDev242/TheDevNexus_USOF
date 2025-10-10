import React from 'react';
import logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function Header({ title = 'TheDevNexus', nav = [], onLogoClick }) {
    return (
        <div className='app-header container'>
            <header className="header" aria-label="Site header">
                <div className="logo" role="button" tabIndex={0} onClick={onLogoClick}>
                    {/* <img className="logo-img" src={logo} alt="TheDevNexus logo" /> */}
                    <h3>TheDevNexus</h3>
                </div>
            </header>
            <nav aria-label="Main navigation">
                <ul className="nav-list">
                    {nav.map((item) => (
                        <li className='nav-list__item' key={item.href}>
                            <a href={item.href}>{item.label}</a>
                        </li>
                    ))}
                </ul>
            </nav>
            <form className='search' action='/search' method='GET'>
                <input className='search__input' type='text' name='query' placeholder='Search...'></input>
                <button className='search__button' type='submit' aria-label='Search'>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
            </form>
        </div>
    );
}