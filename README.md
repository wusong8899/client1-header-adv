# Client1 Header Advertisement Extension

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Flarum](https://img.shields.io/badge/flarum-v1.0+-orange.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A modern, modular [Flarum](http://flarum.org) extension that adds a responsive advertisement slideshow to the header area. Completely refactored for better maintainability, error handling, and performance.

## Features

- 📱 **Mobile Responsive**: Automatically adapts to different screen sizes
- 🎨 **Customizable Slideshow**: Support for up to 30 advertisement slides
- ⚡ **Performance Optimized**: Modular architecture with lazy loading
- 🛡️ **Error Handling**: Comprehensive error handling and validation
- 🌐 **Multi-language**: Support for English and Chinese translations
- 🔧 **Easy Configuration**: Simple admin interface for managing advertisements

## Installation

Install with composer:

```bash
composer require wusong8899/client1-header-adv:"*"
```

## Configuration

### Admin Panel

1. Navigate to **Administration** → **Extensions**
2. Enable the **Client1 Header Advertisement** extension
3. Click **Settings** to configure:

#### Basic Settings

- **Transition Time**: Speed of transitions between slides (default: 5000ms)

#### Advertisement Slides (1-30)

For each slide, configure:

- **Image URL**: Direct link to the advertisement image
- **Link URL**: Destination URL when the advertisement is clicked

### Example Configuration

```yaml
# Slide 1
Image URL: https://example.com/ad1.jpg
Link URL: https://example.com/product1

# Slide 2
Image URL: https://example.com/ad2.jpg
Link URL: https://example.com/product2
```

## Architecture

This extension has been completely refactored with a modular architecture:

### Key Components

- **SlideshowManager**: Handles slideshow creation and Swiper.js integration
- **UIManager**: Manages UI components and layout transformations
- **DataLoader**: Centralized data loading with error handling
- **ConfigManager**: Configuration management and validation
- **ErrorHandler**: Comprehensive error handling and logging

### File Structure

```
src/
├── SettingsHelper.php          # PHP settings configuration
js/src/
├── admin/
│   ├── index.js               # Admin interface
│   └── SettingsGenerator.js   # Settings form generator
└── forum/
    ├── components/            # UI components
    ├── services/              # Business logic
    ├── utils/                 # Utility modules
    └── index.ts               # Main initializer
```

## Development

### Prerequisites

- Node.js 16+
- pnpm package manager
- PHP 7.4+
- Flarum 1.0+

### Building

```bash
cd js
pnpm install
pnpm run build
```

### Development Mode

```bash
pnpm run dev  # Watch mode for development
```

### Code Quality

```bash
pnpm run lint        # TypeScript type checking
pnpm run format      # Code formatting
pnpm run format-check # Check formatting
```

## Troubleshooting

### Common Issues

#### Slides Not Displaying

- Verify image URLs are accessible
- Check browser console for errors
- Ensure at least one slide is configured

#### Mobile Layout Problems

- Clear browser cache
- Check responsive design settings
- Verify mobile detection is working

#### Performance Issues

- Reduce number of active slides
- Optimize image sizes
- Check error logs in browser console

### Debug Information

Enable browser console logging to see detailed error information and performance metrics.

## Migration from Previous Versions

This version includes significant architectural improvements:

### What's New

- ✅ Modular codebase (was 594-line monolithic file)
- ✅ Comprehensive error handling
- ✅ TypeScript support
- ✅ Mobile-first responsive design
- ✅ Performance optimizations
- ✅ Better configuration management

### Breaking Changes

- Internal API completely rewritten
- Custom modifications will need updating
- No changes required for end-user configuration

## License

MIT License. See [LICENSE.md](LICENSE.md) for details.

## Support

- 📖 [Architecture Documentation](ARCHITECTURE.md)
- 💬 [Flarum Community](https://discuss.flarum.org)

## Changelog

### v1.0.0 (Current)

- Complete architectural refactor
- Added comprehensive error handling
- Improved mobile responsiveness
- Added TypeScript support
- Enhanced configuration management
- Performance optimizations
