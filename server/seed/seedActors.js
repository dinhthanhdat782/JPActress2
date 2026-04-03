const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Actor = require('../models/Actor');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const actors = [
  // Asian Actors
  { name: 'Takeshi Kaneshiro', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/takeshi-kaneshiro', tags: 'asian' },
  { name: 'Gong Li', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/gong-li', tags: 'asian' },
  { name: 'Tony Leung', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/tony-leung', tags: 'asian' },
  { name: 'Zhang Ziyi', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/zhang-ziyi', tags: 'asian' },
  { name: 'Ken Watanabe', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/ken-watanabe', tags: 'asian' },
  { name: 'Fan Bingbing', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/fan-bingbing', tags: 'asian' },
  // European Actors
  { name: 'Marion Cotillard', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/marion-cotillard', tags: 'european' },
  { name: 'Mads Mikkelsen', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/mads-mikkelsen', tags: 'european' },
  { name: 'Penelope Cruz', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/penelope-cruz', tags: 'european' },
  { name: 'Daniel Craig', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/daniel-craig', tags: 'european' },
  { name: 'Lea Seydoux', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/lea-seydoux', tags: 'european' },
  { name: 'Christoph Waltz', imageUrl: 'https://via.placeholder.com/400x500', profileLink: '/actors/christoph-waltz', tags: 'european' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear old data
    await Actor.deleteMany();
    await User.deleteMany();
    console.log('Old data cleared');

    // Seed actors
    await Actor.insertMany(actors);
    console.log(`${actors.length} actors seeded`);

    // Seed admin account
    await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin account created: admin / admin123');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();