import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import App from './App.jsx';
import './style/styles.css';

import { store, fetchUsers } from './store.js';

function Boot() {
    const dispatch = useDispatch();
    const { apiStatus, usersCount } = useSelector((s) => s.app);

    useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

    return (
        <>
            <div className="status-bar">Backend API: {apiStatus}{usersCount !== null ? ` • users=${usersCount}` : ''}</div>
            <App />
        </>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Boot />
        </Provider>
    </React.StrictMode>
);
