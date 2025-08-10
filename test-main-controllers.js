import connectDB from "./Src/Database/index.js";
import { Main } from "./Src/Models/main.Models.js";
import { Giveaway } from "./Src/Models/giveaway.Models.js";
import { Purchase } from "./Src/Models/purchase.Models.js";
import { Winner } from "./Src/Models/winner.Models.js";
import { User } from "./Src/Models/user.Models.js";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import http from 'http';

// Load environment variables
dotenv.config();

// Test configuration
const BASE_URL = 'http://localhost:4000';
const API_BASE = `${BASE_URL}/api/v1/main`;

// Test helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testDatabaseOperations = async () => {
    console.log('\n📊 Testing Database Operations...');
    
    try {
        // Test Main document creation
        console.log('🏗️ Testing Main document creation...');
        let main = await Main.findOne();
        if (!main) {
            main = new Main({
                banners: [],
                participantCounts: [],
                recentWinners: []
            });
            await main.save();
            console.log('✅ Main document created successfully');
        } else {
            console.log('✅ Main document already exists');
        }

        // Test adding a banner
        console.log('🎨 Testing banner addition...');
        main.banners.push({
            title: 'Test Banner',
            image: 'https://example.com/test-banner.jpg',
            isActive: true,
            createdBy: new mongoose.Types.ObjectId()
        });
        await main.save();
        console.log('✅ Banner added successfully');

        // Test participant count update
        console.log('📈 Testing participant count update...');
        const testGiveawayId = new mongoose.Types.ObjectId();
        await main.updateParticipantCount(testGiveawayId, 150);
        console.log('✅ Participant count updated successfully');

        // Test fetching updated main document
        const updatedMain = await Main.findOne();
        console.log('📊 Main document stats:', {
            bannersCount: updatedMain.banners.length,
            participantCountsCount: updatedMain.participantCounts.length,
            recentWinnersCount: updatedMain.recentWinners.length
        });

        return true;
    } catch (error) {
        console.error('❌ Database operations failed:', error.message);
        return false;
    }
};

const testLiveParticipantCounting = async () => {
    console.log('\n🔢 Testing Live Participant Counting Logic...');
    
    try {
        // Check for existing giveaways
        const giveaways = await Giveaway.find({ status: 'active' }).limit(1);
        
        if (giveaways.length === 0) {
            console.log('⚠️ No active giveaways found to test participant counting');
            return true;
        }

        const giveaway = giveaways[0];
        console.log(`🎯 Testing with giveaway: ${giveaway.title}`);

        // Count participants who bought products between giveaway dates
        const participantCount = await Purchase.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: giveaway.startDate,
                        $lte: giveaway.endDate
                    }
                }
            },
            {
                $group: {
                    _id: "$userId"
                }
            },
            {
                $count: "totalParticipants"
            }
        ]);

        const count = participantCount[0]?.totalParticipants || 0;
        console.log(`� Found ${count} unique participants for this giveaway`);

        // Update the count in main document
        let main = await Main.findOne();
        if (!main) {
            main = new Main();
        }

        await main.updateParticipantCount(giveaway._id, count);
        console.log('✅ Participant count updated in main document');

        return true;
    } catch (error) {
        console.error('❌ Live participant counting failed:', error.message);
        return false;
    }
};

const testRecentWinners = async () => {
    console.log('\n🏆 Testing Recent Winners Logic...');
    
    try {
        // Get recent winners
        const recentWinners = await Winner.find()
            .populate('userId', 'name')
            .populate('giveawayId', 'title')
            .sort({ wonAt: -1 })
            .limit(5)
            .select('userId giveawayId prizeWon wonAt');

        console.log(`�️ Found ${recentWinners.length} recent winners`);

        if (recentWinners.length > 0) {
            const formattedWinners = recentWinners.map(winner => ({
                displayName: winner.userId?.name || "Anonymous",
                giveawayTitle: winner.giveawayId?.title || "Unknown Giveaway", 
                prizeWon: winner.prizeWon?.name || "Prize",
                wonAt: winner.wonAt
            }));

            console.log('🏅 Recent winners formatted:', formattedWinners.map(w => w.displayName).join(', '));
            
            // Update main document with recent winners
            let main = await Main.findOne();
            if (!main) {
                main = new Main();
            }

            main.recentWinners = formattedWinners;
            await main.save();
            console.log('✅ Recent winners updated in main document');
        } else {
            console.log('ℹ️ No recent winners found');
        }

        return true;
    } catch (error) {
        console.error('❌ Recent winners test failed:', error.message);
        return false;
    }
};

const testHttpEndpoints = async () => {
    console.log('\n🌐 Testing HTTP Endpoints...');
    
    return new Promise((resolve) => {
        // Test main page endpoint
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/v1/main',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode === 200 && response.success) {
                        console.log('✅ Main page endpoint working:', {
                            banners: response.data?.banners?.length || 0,
                            liveParticipantCounts: response.data?.liveParticipantCounts?.length || 0,
                            recentWinners: response.data?.recentWinners?.length || 0
                        });
                        resolve(true);
                    } else {
                        console.log('❌ Main page endpoint failed:', response.message);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ Main page endpoint error:', error.message);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ HTTP request failed:', error.message);
            console.log('📝 Note: Make sure the server is running on port 4000');
            resolve(false);
        });

        req.setTimeout(5000, () => {
            console.log('❌ HTTP request timeout');
            resolve(false);
        });

        req.end();
    });
};

const testAggregatedMainPageData = async () => {
    console.log('\n🌐 Testing Aggregated Main Page Data...');
    
    try {
        // Get main document
        let main = await Main.findOne();
        if (!main) {
            main = new Main();
            await main.save();
        }

        // Get active banners
        const activeBanners = main.banners.filter(banner => banner.isActive);
        console.log(`🎨 Active banners: ${activeBanners.length}`);

        // Get live participant counts
        const activeGiveaways = await Giveaway.find({ 
            status: 'active',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).select('_id title startDate endDate');

        console.log(`🎯 Active giveaways: ${activeGiveaways.length}`);

        const liveParticipantCounts = [];
        for (const giveaway of activeGiveaways) {
            const participantCount = await Purchase.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: giveaway.startDate,
                            $lte: giveaway.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: "$userId"
                    }
                },
                {
                    $count: "totalParticipants"
                }
            ]);

            const count = participantCount[0]?.totalParticipants || 0;
            liveParticipantCounts.push({
                giveawayId: giveaway._id,
                giveawayTitle: giveaway.title,
                currentParticipants: count,
                startDate: giveaway.startDate,
                endDate: giveaway.endDate
            });
        }

        console.log('📊 Live participant counts generated for all active giveaways');

        // Simulate main page data response
        const mainPageData = {
            banners: activeBanners,
            liveParticipantCounts,
            recentWinners: main.recentWinners || []
        };

        console.log('✅ Main page data aggregated successfully:', {
            banners: mainPageData.banners.length,
            liveParticipantCounts: mainPageData.liveParticipantCounts.length,
            recentWinners: mainPageData.recentWinners.length
        });

        return true;
    } catch (error) {
        console.error('❌ Aggregated main page data test failed:', error.message);
        return false;
    }
};

// Main test runner
const runTests = async () => {
    console.log('🚀 Starting Main Controllers Test Suite...\n');
    console.log('📝 This test focuses on database operations and business logic');
    console.log('🌐 For HTTP endpoint testing, use Postman or the running server at http://localhost:4000\n');
    
    try {
        // Connect to database
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully');

        // Run tests
        const results = [];
        
        results.push(await testDatabaseOperations());
        results.push(await testLiveParticipantCounting());
        results.push(await testRecentWinners());
        results.push(await testAggregatedMainPageData());
        results.push(await testHttpEndpoints());

        // Summary
        const passedTests = results.filter(Boolean).length;
        const totalTests = results.length;

        console.log('\n🎉 Test Suite Completed!');
        console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('✅ All tests passed! Your main controllers are ready to use.');
        } else {
            console.log('⚠️ Some tests failed. Please check the errors above.');
        }

        console.log('\n� API Endpoints Available:');
        console.log('� GET  /api/v1/main - Main page data');
        console.log('📍 GET  /api/v1/main/banners/active - Active banners');
        console.log('📍 GET  /api/v1/main/live-counts - Live participant counts');
        console.log('📍 POST /api/v1/main/banners - Add banner (Admin)');
        console.log('📍 GET  /api/v1/main/banners - Get all banners (Admin)');

        process.exit(passedTests === totalTests ? 0 : 1);

    } catch (error) {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('💥 Unhandled Rejection:', error);
    process.exit(1);
});

// Run the tests
runTests();
