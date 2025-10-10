import React from 'react';
import Header from './components/Header';

export default function App() {
    return (
        <>
            <Header
                title="TheDevNexus"
                nav={[
                    { href: '/about', label: 'About us' },
                    { href: '/', label: 'Main' },
                    { href: '/posts', label: 'Post' },
                ]}
                onLogoClick={() => console.log('Logo clicked')}
            />
            <main className="container">
                <h1>Main</h1>
            </main>
        </>
    );
}