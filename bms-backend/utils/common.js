const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(String(email).toLowerCase());
    return { isValid, message: isValid ? 'Valid email' : 'Invalid email format' };
};

const validatePhoneNumber = (phone, countryCode) => {
    if (!phone) return { isValid: false, message: 'Phone number is required' };
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 6 || digits.length > 15) {
        return { isValid: false, message: 'Phone number must be 6-15 digits' };
    }
    return { isValid: true, message: 'Valid phone number' };
};

const generateBookingId = () => {
    const now = new Date();
    const dateStr =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 6; i++) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BMS${dateStr}${random}`;
};

// Convenience fee: ₹18 per seat. GST: 28% of (subtotal + convenience_fee).
const calculateTotalAmount = (seats) => {
    const subtotal = seats.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);
    const convenienceFee = 18 * seats.length;
    const taxes = parseFloat(((subtotal + convenienceFee) * 0.28).toFixed(2));
    const totalAmount = parseFloat((subtotal + convenienceFee + taxes).toFixed(2));
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        convenience_fee: parseFloat(convenienceFee.toFixed(2)),
        taxes,
        total_amount: totalAmount,
    };
};

module.exports = {
    validateEmail,
    validatePhoneNumber,
    generateBookingId,
    calculateTotalAmount,
};
