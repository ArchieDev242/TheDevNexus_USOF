import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import App from './App.jsx';
import './style/styles.css';
import './style/home.css';

import { store } from './redux/store.js';
import { fetch_current_user } from './redux/slices/authSlice.js';

function Boot() 
{
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetch_current_user());
    }, [dispatch]);

    return <App />;
}

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Boot />
        </Provider>
    </React.StrictMode>
);
