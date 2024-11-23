const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');

const authController = {
    // Login handler
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log('Login attempt for:', email);
            console.log('Password received:', password); // Debug log

            // Validate input
            if (!email || !password) {
                console.log('Missing credentials'); // Debug log
                return res.status(400).json({ 
                    message: 'Email and password are required' 
                });
            }

            // Find user
            const user = await userModel.findByEmail(email);
            console.log('User found:', user ? 'Yes' : 'No');
            console.log('Stored hash:', user?.password_hash); // Debug log
            
            if (!user) {
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }

            // Verify password
            console.log('Comparing passwords...');
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            console.log('Password valid:', isValidPassword);
            
            if (!isValidPassword) {
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            await userModel.updateLastLogin(user.id);

            // Return user info and token
            const { password_hash, ...userWithoutPassword } = user;
            res.json({
                user: userWithoutPassword,
                token
            });

        } catch (error) {
            logger.error('Login error:', error);
            console.error('Full error:', error); // Debug log
            res.status(500).json({ message: 'Error during login' });
        }
    },

    // Register handler
    register: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            // Validate input
            if (!email || !password || !name) {
                return res.status(400).json({ 
                    message: 'Email, password, and name are required' 
                });
            }

            // Check if user exists
            const existingUser = await userModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ 
                    message: 'Email already registered' 
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Create user
            const user = await userModel.create({
                email,
                password_hash,
                name,
                role: 'user',
                status: 'active'
            });

            // Generate token
            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Return user info and token
            const { password_hash: ph, ...userWithoutPassword } = user;
            res.status(201).json({
                user: userWithoutPassword,
                token
            });

        } catch (error) {
            logger.error('Registration error:', error);
            res.status(500).json({ message: 'Error during registration' });
        }
    }
};

module.exports = authController; 