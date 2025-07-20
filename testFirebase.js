import admin from './firebaseConfig.js';

async function testConnection() {
  console.log('Starting Firebase test...');
  try {
    const userList = await admin.auth().listUsers();
    console.log('Successfully connected to Firebase. Total users:', userList.users.length);
  } catch (error) {
    console.error('Error connecting to Firebase:', error);
  }
  console.log('Test finished.');
}

testConnection();
