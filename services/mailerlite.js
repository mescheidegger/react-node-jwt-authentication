// mailerlite.js
const MailerLite = require('mailerlite-api-v2-node').default;
const apiKey = process.env.MAILERLITE_API_KEY; // Ensure this environment variable is set
const mailerLite = new MailerLite(apiKey);

const addSubscriber = async (email, username) => {
    try {
        const subscriber = {
            email: email,
            name: username || 'Subscriber', // Use the username or a default value if the username is not provided
            type: 'active', // Set to 'active' to directly add to the list without double opt-in
        };

        const response = await mailerLite.addSubscriber(subscriber);
        return response;
    } catch (error) {
        console.error('Error adding subscriber:', error);
        throw error;
    }
};

const removeSubscriber = async (email) => {
    try {
        const response = await mailerLite.removeSubscriber(email);
        return response;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Handle the case where the subscriber does not exist
            console.error('Subscriber not found:', email);
            return { message: 'Subscriber not found', email: email };
        } else {
            // Handle other errors
            console.error('Error removing subscriber:', error);
            throw error;
        }
    }
};


module.exports = {
    addSubscriber,
    removeSubscriber,
};
