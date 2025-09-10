# Ultimate Finance Dashboard 💰

A powerful, AI-powered finance dashboard that runs entirely in your browser with no backend required. Features neural networks, OCR, advanced data visualizations, and complete offline functionality.

## 🚀 Features

### 🧠 AI & Machine Learning
- **TensorFlow.js Neural Networks** - Smart transaction categorization
- **OCR with Tesseract.js** - Extract data from receipt photos
- **Natural Language Search** - Query your finances in plain English
- **Voice Recognition** - Speak to search and interact
- **Pattern Detection** - AI discovers spending patterns and anomalies

### 📊 Advanced Visualizations
- **Sankey Diagrams** - Money flow visualization
- **Treemap Charts** - Hierarchical spending breakdown
- **Network Graphs** - Merchant relationship mapping
- **Neural Network Visualization** - Real-time AI model activity
- **Interactive Charts** - Powered by Chart.js and D3.js

### 🔒 Privacy & Security
- **100% Local Processing** - No data leaves your device
- **Offline-First** - Works without internet connection
- **Encrypted Storage** - Local data encryption options
- **No Backend Required** - Pure client-side application

### 📱 Progressive Web App
- **Install as App** - Works like a native mobile app
- **Offline Support** - Service worker caching
- **Responsive Design** - Works on all screen sizes
- **Dark Mode** - Eye-friendly dark theme

### 📄 File Support
- **PDF Bank Statements** - Automatic transaction extraction
- **CSV Files** - Import from any bank or financial software
- **Receipt Photos** - OCR processing with camera or uploads
- **Excel Compatibility** - Handles financial spreadsheets

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: TensorFlow.js, Tesseract.js
- **Visualization**: D3.js, Chart.js, d3-sankey
- **Data Processing**: Papa Parse (CSV), PDF.js
- **Storage**: IndexedDB with optional encryption
- **Offline**: Service Worker with advanced caching
- **PWA**: Web App Manifest, installable

## 🚀 Getting Started

1. **Visit the App**: Open [https://michaeljohnpena.com/local-finance/](https://michaeljohnpena.com/local-finance/) in your browser
2. **Install (Optional)**: Click "Install" when prompted to add as PWA
3. **Try the Demo**: Click "Interactive Demo" to see sample data
4. **Upload Files**: Drag & drop bank statements, receipts, or CSV files
5. **Take Photos**: Use "Scan Receipt" to capture receipts with your camera

## 📋 Usage

### Upload Financial Data
- **Bank Statements**: PDF files are automatically processed
- **CSV Exports**: From banks, credit cards, or financial apps
- **Receipt Photos**: Camera capture or file upload with OCR

### AI Features
- **Auto-Categorization**: ML models classify transactions automatically
- **Smart Search**: "Show unusual spending this month"
- **Voice Control**: Use microphone for hands-free operation
- **Pattern Analysis**: AI detects spending trends and anomalies

### Visualizations
- **Money Flow**: Sankey diagrams show income → expenses flow
- **Category Breakdown**: Treemap shows spending by category/merchant
- **Relationships**: Network graph reveals merchant connections
- **Trends**: Time series charts with predictions

### Export & Backup
- **PDF Reports**: Complete financial reports with charts
- **JSON Export**: Raw data for external analysis
- **Encrypted Backup**: Secure local backup files

## 🔧 Development

This is a static web application that can be served by any HTTP server:

```bash
# Simple Python server
python3 -m http.server 8080

# Node.js with http-server
npx http-server

# Any static hosting service
```

## 📦 Deployment

### GitHub Pages
```bash
# Deploy with GitHub CLI
gh repo create your-repo-name --public
git add .
git commit -m "Initial deployment"
git push -u origin main
gh pages deploy --source branch --branch main
```

### Other Hosting
- **Netlify**: Drag & drop the folder
- **Vercel**: Connect GitHub repo
- **Firebase Hosting**: `firebase deploy`
- **Any Static Host**: Upload all files

## 🔒 Privacy & Security

- **No Data Collection**: All processing happens locally
- **No External APIs**: Uses only browser capabilities
- **Optional Encryption**: IndexedDB data can be encrypted
- **HTTPS Required**: For camera and advanced features
- **No Tracking**: No analytics or external scripts

## 🌟 Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Most features (some PWA limitations)
- **Mobile**: Full support on modern browsers

## 📱 PWA Features

- **Offline Access**: Works without internet
- **App Install**: Add to home screen
- **Background Sync**: Sync when connection returns
- **Push Notifications**: Financial alerts (optional)
- **Native Feel**: Looks and feels like a native app

## 🤝 Contributing

This is a self-contained application. To modify:

1. Fork the repository
2. Edit `index.html` for UI changes
3. Modify `sw.js` for offline behavior
4. Update `manifest.json` for PWA settings
5. Test locally with HTTP server
6. Deploy to your hosting platform

## 📄 License

MIT License - Use freely for personal or commercial projects.

## 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Ensure HTTPS for full functionality
3. Try different browsers if issues persist
4. Clear browser cache and reload

---

**Built with ❤️ using modern web technologies**

*No servers, no subscriptions, no data collection - just pure client-side financial intelligence.*