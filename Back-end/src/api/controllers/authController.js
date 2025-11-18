import jwt from 'jsonwebtoken';
import User from '../../models/User.model.js';

/**
 * ========================================
 * AUTH CONTROLLER
 * ========================================
 */

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return { accessToken, refreshToken };
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user (include password field)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.userId);

        // Save refresh token to database
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Remove password from response
        const userResponse = user.toJSON();

        res.json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            accessToken
        });

        console.log(`✅ User logged in: ${user.username} (${user.role})`);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            // Remove refresh token from database
            await User.findOneAndUpdate(
                { refreshToken },
                { $unset: { refreshToken: 1 } }
            );
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logout successful'
        });

        console.log(`✅ User logged out`);
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find user
        const user = await User.findOne({ 
            userId: decoded.userId, 
            refreshToken 
        }).select('+refreshToken');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );

        // Set new access token cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        res.json({
            success: true,
            accessToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Public
 */
export const verifyToken = async (req, res) => {
    try {
        const { accessToken } = req.cookies;

        if (!accessToken) {
            return res.json({
                valid: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        // Get user
        const user = await User.findOne({ userId: decoded.userId }).select('-password -refreshToken');

        if (!user || !user.isActive) {
            return res.json({
                valid: false,
                message: 'User not found or inactive'
            });
        }

        res.json({
            valid: true,
            user: user.toJSON()
        });
    } catch (error) {
        res.json({
            valid: false,
            message: 'Invalid token'
        });
    }
};
