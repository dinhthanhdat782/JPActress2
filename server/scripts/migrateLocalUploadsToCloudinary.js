const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const cloudinary = require('../config/cloudinary');
const Actor = require('../models/Actor');

const getLocalFileName = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  if (imageUrl.startsWith('/uploads/')) {
    return decodeURIComponent(imageUrl.replace('/uploads/', ''));
  }

  try {
    const parsed = new URL(imageUrl);
    const marker = '/uploads/';
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch (error) {
    return null;
  }
};

const run = async () => {
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    await connectDB();

    const actors = await Actor.find({});
    console.log(`Found ${actors.length} actors`);

    for (const actor of actors) {
      const fileName = getLocalFileName(actor.imageUrl);
      if (!fileName) {
        skipped += 1;
        continue;
      }

      const localPath = path.join(__dirname, '..', 'uploads', fileName);
      if (!fs.existsSync(localPath)) {
        failed += 1;
        console.warn(`Missing local file for actor ${actor._id}: ${localPath}`);
        continue;
      }

      try {
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'jpactress',
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
        });

        actor.imageUrl = result.secure_url;
        actor.imagePublicId = result.public_id;
        await actor.save();

        updated += 1;
        console.log(`Migrated actor ${actor._id}: ${fileName} -> ${result.public_id}`);
      } catch (error) {
        failed += 1;
        console.error(`Failed actor ${actor._id}: ${error.message}`);
      }
    }

    console.log('Migration complete');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
