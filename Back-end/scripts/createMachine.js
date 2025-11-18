import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Machine from '../src/models/Machine.model.js';

// ✅ FIX: Get current directory và load .env từ Back-end/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Script để thêm 1 máy mới vào database
 * Usage: cd Back-end && node scripts/createMachine.js
 */

const addMachine = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        
        // Verify MONGO_URI exists
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI not found in .env file!');
            console.log('   Please check Back-end/.env file');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // CẤU HÌNH MÁY MỚI Ở ĐÂY
        const newMachine = {
            machineId: 'SPRAY001',           
            name: 'Máy Phun Sơn',          
            type: 'Spray Machine',           
            location: 'Workshop B',          
            ip: '192.168.0.155',             
            port: 5000,
            userId:              
            status: 'offline',
            isConnected: false
        };

        // Kiểm tra xem máy đã tồn tại chưa
        const existingMachine = await Machine.findOne({ machineId: newMachine.machineId });
        if (existingMachine) {
            console.log(`⚠️  Machine ${newMachine.machineId} already exists!`);
            console.log('   _id:', existingMachine._id);
            console.log('   Name:', existingMachine.name);
            console.log('\n   To delete it first, run:');
            console.log(`   node scripts/deleteMachine.js ${newMachine.machineId}`);
            process.exit(0);
        }

        // Tạo máy mới
        const machine = await Machine.create(newMachine);
        console.log(`✅ Created machine: ${machine.name} (${machine.machineId})`);
        console.log('   _id:', machine._id);
        console.log('   Type:', machine.type);
        console.log('   IP:', machine.ip);
        console.log('   Location:', machine.location);
        console.log('   Status:', machine.status);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.name === 'ValidationError') {
            console.log('\n📋 Validation errors:');
            Object.keys(error.errors).forEach(key => {
                console.log(`   - ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

addMachine();