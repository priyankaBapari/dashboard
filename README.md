# Smart Personal Dashboard

A beautiful, modern, responsive personal dashboard web application built with HTML, CSS, and Vanilla JavaScript.

![Dashboard Preview](https://via.placeholder.com/800x450/3b82f6/ffffff?text=Smart+Personal+Dashboard)

## Features

- **Live Digital Clock & Date** - Real-time clock with formatted date display
- **Task Management** - Add, complete, edit, delete tasks with priorities and due dates
- **Notes Section** - Create, edit, view, search, and organize notes with tags
- **Dark/Light Mode** - Toggle between themes with persistence
- **LocalStorage Persistence** - All data saved locally in your browser
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Polished transitions and hover effects
- **Keyboard Shortcuts** - Power user shortcuts for common actions
- **Toast Notifications** - Non-intrusive feedback for actions

## Project Structure

```
smart-dashboard/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling with CSS custom properties
├── app.js          # Application logic (Vanilla JS)
└── README.md       # This file
```

## Getting Started

### Option 1: Direct File Open (Simplest)

1. Navigate to the `smart-dashboard` folder
2. Double-click `index.html` to open in your default browser

### Option 2: Local Server (Recommended)

Using Python:
```bash
cd smart-dashboard
python -m http.server 8000
```
Then open http://localhost:8000

Using Node.js (http-server):
```bash
cd smart-dashboard
npx http-server
```

Using VS Code Live Server:
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Option 3: Any Static Server

```bash
# PHP
php -S localhost:8000

# Ruby
ruby -run -e httpd . -p 8000
```

## Usage Guide

### Navigation
- **Overview** - Dashboard stats, recent tasks, recent notes, quick actions
- **Tasks** - Full task management with filtering (All/Active/Completed)
- **Notes** - Note creation, search, and tag organization

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New Note |
| `Ctrl/Cmd + T` | New Task |
| `Ctrl/Cmd + K` | Focus Note Search |
| `/` (in Tasks) | Focus Task Input |
| `Escape` | Close Modals |

### Task Features
- **Priorities**: High (red), Medium (amber), Low (green)
- **Due Dates**: Optional date picker with overdue highlighting
- **Filtering**: All / Active / Completed
- **Bulk Actions**: Clear completed tasks

### Note Features
- **Rich Content**: Multi-line text support
- **Tags**: Comma-separated tags with autocomplete suggestions
- **Search**: Real-time filtering by title, content, or tags
- **Dropdown Menu**: Edit/Delete from note cards

### Theme
- Click the sun/moon icon in the sidebar to toggle
- Preference saved to localStorage
- Respects system preference on first visit

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Data Storage

All data is stored in your browser's localStorage:
- `smartdash_tasks` - Task array
- `smartdash_notes` - Notes array
- `smartdash_theme` - Theme preference ('light' or 'dark')

Data persists between browser sessions. To reset, clear localStorage for this origin.

## Customization

### Colors
Modify CSS custom properties in `styles.css`:
```css
:root {
    --accent-primary: #3b82f6;    /* Primary blue */
    --accent-secondary: #10b981;  /* Success green */
    --accent-warning: #f59e0b;    /* Warning amber */
    --accent-danger: #ef4444;     /* Danger red */
}
```

### Font
Change the font import in `index.html` and update `--font-family` in CSS.

## Development

### Code Organization

- **HTML**: Semantic structure with accessibility attributes
- **CSS**: Custom properties for theming, mobile-first responsive design
- **JS**: Modular structure with state management, storage service, UI controller

### Adding Features

1. Add HTML structure in `index.html`
2. Add styles in `styles.css` (follow existing patterns)
3. Add logic in `app.js` (follow existing module pattern)

## License

MIT License - Feel free to use and modify for personal or commercial projects.

## Credits

- Font: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- Icons: Custom SVG icons (no external dependencies)
- Inspired by modern dashboard UI patterns

---

Built with ❤️ using vanilla web technologies