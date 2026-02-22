import axios from 'axios';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

const TOTAL_USERS = 40;
const API_URL = 'http://localhost:3000/api/v1/register/user';

const LOCATIONS = [
  'Egypt',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Canada',
  'Australia',
  'Japan',
];

const TIMEZONES = [
  'Africa/Cairo',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Rome',
  'America/Toronto',
  'Australia/Sydney',
  'Asia/Tokyo',
];

const ORGANIZATIONS = [
  'Evntaly',
  'TechCorp',
  'InnovateLabs',
  'DigitalSolutions',
  'CloudTech',
  'N/A',
];

const headers = {
  secret: '3f50d965ea75e891',
  pat: '81753c32cdb8013bbd23f0d10717',
  'Content-Type': 'application/json',
};

async function registerUser() {
  const randomLocation =
    LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const randomTimezone =
    TIMEZONES[Math.floor(Math.random() * TIMEZONES.length)];
  const randomOrg =
    ORGANIZATIONS[Math.floor(Math.random() * ORGANIZATIONS.length)];

  const userData = {
    id: uuidv4(),
    email: faker.internet.email(),
    full_name: faker.person.fullName(),
    organization: randomOrg,
    data: {
      Location: randomLocation,
      timezone: randomTimezone,
    },
  };

  try {
    await axios.post(API_URL, userData, { headers });
    console.log(`✅ User registered successfully: ${userData.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to register user: ${userData.email}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function seedUsers() {
  console.log(`🚀 Starting to seed ${TOTAL_USERS} users...`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < TOTAL_USERS; i++) {
    // Add a small delay between requests to prevent overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 100));

    const success = await registerUser();
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Log progress every 10 users
    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1}/${TOTAL_USERS} users processed`);
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`✅ Successfully registered: ${successCount} users`);
  console.log(`❌ Failed to register: ${failureCount} users`);
  console.log('✨ Seeding completed!');
}

// Run the seeding
seedUsers().catch(console.error);
