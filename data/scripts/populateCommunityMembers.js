const fs = require('fs');
const mongoose = require('mongoose');

const users = JSON.parse(fs.readFileSync(`../ignore_users_with_password.json`, 'utf-8'));
const BACKEND_URL = 'http://localhost:3000';

const loginUser = async (email, password) => {
    const response = await fetch(`${BACKEND_URL}/api/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = response.json();
    return data.token;
}

const fetchCommunities = async () => {
    const response = await fetch(`${BACKEND_URL}/api/community/`);
    const data = response.json();
    return data.data;
}

const joinCommunity = async (token, communityId) => {
    
}

const communities = await fetchCommunities();
const totalCommunities = communities.length;
users.forEach(async user => {
    const token = await loginUser(user.email, user.password);
    

})