# Payment API Integration Setup

This guide will help you set up Paytm and BHIM API integration for automatic transaction syncing.

## Prerequisites

- Paytm Business Account
- BHIM Developer Account
- Valid API credentials from both platforms

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Paytm API Configuration
REACT_APP_PAYTM_API_URL=https://api.paytm.com
REACT_APP_PAYTM_CLIENT_ID=your_paytm_client_id_here
REACT_APP_PAYTM_REDIRECT_URI=http://localhost:3000/auth/callback

# BHIM API Configuration
REACT_APP_BHIM_API_URL=https://api.bhimupi.org.in
REACT_APP_BHIM_APP_ID=your_bhim_app_id_here
REACT_APP_BHIM_APP_SECRET=your_bhim_app_secret_here
```

## Getting API Credentials

### Paytm API Setup

1. Visit [Paytm Developer Portal](https://developer.paytm.com/)
2. Create a developer account
3. Register your application
4. Get your Client ID
5. Configure redirect URI for OAuth flow
6. Set up required scopes (read_transactions, read_profile)

### BHIM API Setup

1. Visit [BHIM Developer Portal](https://www.bhimupi.org.in/developer)
2. Register as a developer
3. Create a new application
4. Get your App ID and App Secret
5. Configure UPI ID for transaction monitoring

## Features

### Automatic Transaction Categorization

The system automatically categorizes transactions based on:
- Merchant names
- Transaction descriptions
- Payment patterns

Categories include:
- 🍽️ Food & Dining
- 🏠 Housing
- 🚗 Transportation
- 🛍️ Shopping
- ❤️ Healthcare
- 🎬 Entertainment
- 📚 Education
- 💰 Income
- And more...

### Smart Sync

- **Manual Sync**: Sync transactions on-demand
- **Auto Sync**: Configure automatic syncing intervals
- **Duplicate Prevention**: Avoid importing duplicate transactions
- **Real-time Updates**: Get latest transaction data

### Payment Method Indicators

- **Paytm**: Blue "P" indicator
- **BHIM**: Green "B" indicator
- **Other**: Generic indicator

## Usage

1. **Connect Paytm Account**
   - Open the Payment Sync component
   - Click "Connect Paytm" button
   - Complete OAuth authorization on Paytm's website
   - Your account will be automatically connected

2. **Configure BHIM (Optional)**
   - Enter your BHIM UPI ID in the settings
   - Save configuration

2. **Sync Transactions**
   - Click "Sync Now" for manual sync
   - Enable auto-sync for automatic updates
   - Monitor sync status and errors

3. **View Transactions**
   - All synced transactions appear in the transaction list
   - Colorful category icons for easy identification
   - Payment method indicators show the source

## Security Notes

- Never commit your `.env` file to version control
- Keep your API credentials secure
- Regularly rotate your API keys
- Monitor API usage and limits

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your API credentials
   - Check if your account is active
   - Ensure you have proper permissions

2. **No Transactions Found**
   - Verify phone number/UPI ID
   - Check date range settings
   - Ensure transactions exist in the specified period

3. **Sync Errors**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Review error logs for specific issues

### Support

For technical support:
- Check the console logs for detailed error messages
- Verify your API configuration
- Ensure all required dependencies are installed

## API Rate Limits

- **Paytm**: Varies by plan, typically 1000 requests/hour
- **BHIM**: Varies by plan, typically 500 requests/hour

Monitor your usage to avoid hitting rate limits.

## Future Enhancements

- Support for more payment platforms
- Advanced categorization using AI
- Bulk transaction import/export
- Real-time transaction notifications
- Advanced analytics and reporting
